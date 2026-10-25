package com.skillproof.api.fetch;

import com.skillproof.api.config.CertificateProperties;
import com.skillproof.api.exception.CertificateFetchException;
import org.jsoup.Connection;
import org.jsoup.Jsoup;
import org.jsoup.UnsupportedMimeTypeException;
import org.jsoup.nodes.Document;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;

/** Downloads a certificate page server-side and reduces it to plain text. */
@Component
public class CertificatePageFetcher {

    private static final int MAX_REDIRECTS = 3;
    private static final String USER_AGENT = "Mozilla/5.0 (compatible; SkillProofBot/1.0)";

    private final UrlSafetyValidator urlSafetyValidator;
    private final CertificateProperties properties;

    public CertificatePageFetcher(UrlSafetyValidator urlSafetyValidator, CertificateProperties properties) {
        this.urlSafetyValidator = urlSafetyValidator;
        this.properties = properties;
    }

    public String fetchText(URI url) {
        Document document = fetchDocument(url);
        String text = extractText(document);
        if (text.length() < properties.minPageTextLength()) {
            throw new CertificateFetchException(
                    "We couldn't read enough text from that page. Many certificate sites load content with "
                            + "JavaScript or block automated access. Please paste the certificate text instead.");
        }
        return text;
    }

    private Document fetchDocument(URI url) {
        URI current = url;
        try {
            // Redirects are followed by hand so every hop goes through the SSRF check
            for (int hop = 0; hop <= MAX_REDIRECTS; hop++) {
                Connection.Response response = request(current);
                if (isRedirect(response.statusCode())) {
                    current = nextHop(current, response);
                    continue;
                }
                if (response.statusCode() != 200) {
                    throw new CertificateFetchException("The certificate page returned an error (HTTP "
                            + response.statusCode() + "). Please paste the certificate text instead.");
                }
                return response.parse();
            }
            throw new CertificateFetchException("The certificate link redirected too many times.");
        } catch (UnsupportedMimeTypeException e) {
            throw new CertificateFetchException(
                    "That link isn't a web page (it may be a PDF or image). Please paste the certificate text instead.", e);
        } catch (IOException e) {
            throw new CertificateFetchException(
                    "We couldn't load that page. Please check the link or paste the certificate text instead.", e);
        }
    }

    private Connection.Response request(URI url) throws IOException {
        return Jsoup.connect(url.toString())
                .userAgent(USER_AGENT)
                .timeout((int) properties.fetchTimeout().toMillis())
                .maxBodySize((int) properties.maxPageSize().toBytes())
                .followRedirects(false)
                .ignoreHttpErrors(true)
                .execute();
    }

    private URI nextHop(URI current, Connection.Response response) {
        String location = response.header("Location");
        if (location == null || location.isBlank()) {
            throw new CertificateFetchException("The certificate link redirected to an invalid address.");
        }
        return urlSafetyValidator.validate(current.resolve(location).toString());
    }

    private static boolean isRedirect(int status) {
        return status >= 300 && status < 400;
    }

    private static String extractText(Document document) {
        document.select("script, style, noscript, svg, nav, footer").remove();
        String body = document.body() != null ? document.body().text() : document.text();
        return (document.title() + "\n" + body).strip();
    }
}
