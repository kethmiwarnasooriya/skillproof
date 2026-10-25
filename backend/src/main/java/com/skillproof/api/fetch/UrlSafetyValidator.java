package com.skillproof.api.fetch;

import com.skillproof.api.exception.InvalidCertificateUrlException;
import org.springframework.stereotype.Component;

import java.net.Inet4Address;
import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.Locale;
import java.util.Set;

/**
 * SSRF guard: only public http(s) URLs on default ports are allowed.
 * Every IP the host resolves to is checked, so a public-looking name pointing at an internal address is rejected.
 * Residual risk: DNS rebinding (the name re-resolving to a private IP between this check and the fetch)
 * is not fully prevented without pinning the resolved IP in the HTTP client.
 */
@Component
public class UrlSafetyValidator {

    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");
    private static final Set<Integer> ALLOWED_PORTS = Set.of(-1, 80, 443);

    /** Resolves a host name to IPs; swappable in tests to avoid real DNS lookups. */
    @FunctionalInterface
    interface HostResolver {
        InetAddress[] resolve(String host) throws UnknownHostException;
    }

    private final HostResolver hostResolver;

    public UrlSafetyValidator() {
        this(InetAddress::getAllByName);
    }

    UrlSafetyValidator(HostResolver hostResolver) {
        this.hostResolver = hostResolver;
    }

    public URI validate(String rawUrl) {
        URI uri = parse(rawUrl);
        checkScheme(uri);
        checkHostAndPort(uri);
        checkResolvedAddresses(uri.getHost());
        return uri;
    }

    private URI parse(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new InvalidCertificateUrlException("Certificate URL is required.");
        }
        try {
            return new URI(rawUrl.trim());
        } catch (URISyntaxException e) {
            throw new InvalidCertificateUrlException("That doesn't look like a valid URL.");
        }
    }

    private void checkScheme(URI uri) {
        String scheme = uri.getScheme();
        if (scheme == null || !ALLOWED_SCHEMES.contains(scheme.toLowerCase(Locale.ROOT))) {
            throw new InvalidCertificateUrlException("Only http and https links are supported.");
        }
    }

    private void checkHostAndPort(URI uri) {
        if (uri.getHost() == null || uri.getHost().isBlank()) {
            throw new InvalidCertificateUrlException("That doesn't look like a valid URL.");
        }
        // "https://trusted.com@evil.internal" style tricks
        if (uri.getRawUserInfo() != null) {
            throw new InvalidCertificateUrlException("URLs with embedded credentials are not allowed.");
        }
        if (!ALLOWED_PORTS.contains(uri.getPort())) {
            throw new InvalidCertificateUrlException("Only standard web ports (80 and 443) are allowed.");
        }
    }

    private void checkResolvedAddresses(String host) {
        InetAddress[] addresses;
        try {
            addresses = hostResolver.resolve(host);
        } catch (UnknownHostException e) {
            throw new InvalidCertificateUrlException("We couldn't find that website. Check the link and try again.");
        }
        for (InetAddress address : addresses) {
            if (isBlocked(address)) {
                throw new InvalidCertificateUrlException("This link points to a private or local address and can't be used.");
            }
        }
    }

    static boolean isBlocked(InetAddress address) {
        return address.isAnyLocalAddress()      // 0.0.0.0, ::
                || address.isLoopbackAddress()  // 127.0.0.0/8, ::1
                || address.isLinkLocalAddress() // 169.254.0.0/16 (cloud metadata), fe80::/10
                || address.isSiteLocalAddress() // 10/8, 172.16/12, 192.168/16
                || address.isMulticastAddress()
                || isOtherReservedIpv4(address)
                || isUniqueLocalIpv6(address);
    }

    private static boolean isOtherReservedIpv4(InetAddress address) {
        if (!(address instanceof Inet4Address)) {
            return false;
        }
        byte[] b = address.getAddress();
        int first = b[0] & 0xFF;
        int second = b[1] & 0xFF;
        return first == 0                                     // 0.0.0.0/8
                || (first == 100 && second >= 64 && second <= 127) // 100.64.0.0/10 carrier-grade NAT
                || (first == 192 && second == 0 && (b[2] & 0xFF) == 0) // 192.0.0.0/24 protocol assignments
                || first >= 240;                              // 240.0.0.0/4 reserved + broadcast
    }

    private static boolean isUniqueLocalIpv6(InetAddress address) {
        // fc00::/7 is the IPv6 equivalent of private ranges
        return address instanceof Inet6Address && (address.getAddress()[0] & 0xFE) == 0xFC;
    }
}
