package com.skillproof.api.fetch;

import com.skillproof.api.exception.InvalidCertificateUrlException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.net.InetAddress;
import java.net.URI;
import java.net.UnknownHostException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UrlSafetyValidatorTest {

    private static final InetAddress PUBLIC_IP = ip("93.184.215.14");

    // Never touches real DNS: every host name resolves to a public IP unless a test says otherwise
    private final UrlSafetyValidator validator = new UrlSafetyValidator(host -> new InetAddress[]{PUBLIC_IP});

    @Test
    void acceptsPublicHttpsUrl() {
        URI uri = validator.validate("  https://www.coursera.org/account/accomplishments/verify/ABC123  ");

        assertThat(uri.getHost()).isEqualTo("www.coursera.org");
    }

    @Test
    void acceptsHttpAndExplicitStandardPorts() {
        validator.validate("http://example.com/cert");
        validator.validate("https://example.com:443/cert");
    }

    @ParameterizedTest
    @ValueSource(strings = {"ftp://example.com/cert", "file:///etc/passwd", "javascript:alert(1)", "gopher://example.com"})
    void rejectsNonHttpSchemes(String url) {
        assertRejected(url, "Only http and https");
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   ", "not a url", "https://", "example.com/no-scheme"})
    void rejectsMalformedUrls(String url) {
        assertThatThrownBy(() -> validator.validate(url)).isInstanceOf(InvalidCertificateUrlException.class);
    }

    @Test
    void rejectsNullUrl() {
        assertThatThrownBy(() -> validator.validate(null)).isInstanceOf(InvalidCertificateUrlException.class);
    }

    @Test
    void rejectsEmbeddedCredentials() {
        assertRejected("https://trusted.com@evil.example/cert", "credentials");
    }

    @Test
    void rejectsNonStandardPorts() {
        assertRejected("https://example.com:8080/cert", "ports");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "http://127.0.0.1/", "http://127.1.2.3/", "http://[::1]/",                 // loopback
            "http://0.0.0.0/", "http://[::]/",                                        // any-local
            "http://10.0.0.5/", "http://172.16.0.1/", "http://172.31.255.255/", "http://192.168.1.1/", // private
            "http://169.254.169.254/latest/meta-data/",                               // cloud metadata
            "http://[fe80::1]/",                                                      // IPv6 link-local
            "http://[fd12:3456:789a::1]/",                                            // IPv6 unique local
            "http://[::ffff:127.0.0.1]/",                                             // IPv4-mapped loopback
            "http://100.64.0.1/",                                                     // carrier-grade NAT
            "http://224.0.0.1/", "http://255.255.255.255/"                            // multicast, broadcast
    })
    void rejectsLocalAndPrivateIpLiterals(String url) {
        UrlSafetyValidator realResolver = new UrlSafetyValidator(); // IP literals resolve without DNS
        assertThatThrownBy(() -> realResolver.validate(url))
                .isInstanceOf(InvalidCertificateUrlException.class)
                .hasMessageContaining("private or local");
    }

    @Test
    void rejectsHostNameThatResolvesToPrivateIp() {
        UrlSafetyValidator rebinding = new UrlSafetyValidator(host -> new InetAddress[]{ip("10.1.2.3")});

        assertThatThrownBy(() -> rebinding.validate("https://innocent-looking.example/cert"))
                .hasMessageContaining("private or local");
    }

    @Test
    void rejectsWhenAnyResolvedAddressIsPrivate() {
        UrlSafetyValidator mixed = new UrlSafetyValidator(host -> new InetAddress[]{PUBLIC_IP, ip("127.0.0.1")});

        assertThatThrownBy(() -> mixed.validate("https://example.com/cert"))
                .hasMessageContaining("private or local");
    }

    @Test
    void rejectsUnknownHost() {
        UrlSafetyValidator unresolvable = new UrlSafetyValidator(host -> {
            throw new UnknownHostException(host);
        });

        assertRejected(unresolvable, "https://does-not-exist.example/", "couldn't find");
    }

    @Test
    void allowsPublicIpLiterals() {
        assertThat(UrlSafetyValidator.isBlocked(ip("8.8.8.8"))).isFalse();
        assertThat(UrlSafetyValidator.isBlocked(ip("172.32.0.1"))).isFalse(); // just outside 172.16/12
        assertThat(UrlSafetyValidator.isBlocked(ip("100.128.0.1"))).isFalse(); // just outside 100.64/10
        assertThat(UrlSafetyValidator.isBlocked(ip("2606:4700::1111"))).isFalse();
    }

    private void assertRejected(String url, String messagePart) {
        assertRejected(validator, url, messagePart);
    }

    private static void assertRejected(UrlSafetyValidator target, String url, String messagePart) {
        assertThatThrownBy(() -> target.validate(url))
                .isInstanceOf(InvalidCertificateUrlException.class)
                .hasMessageContaining(messagePart);
    }

    private static InetAddress ip(String literal) {
        try {
            return InetAddress.getByName(literal);
        } catch (UnknownHostException e) {
            throw new IllegalArgumentException(e);
        }
    }
}
