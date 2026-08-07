package com.cobuild.backend.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    private final Map<String, Bucket> otpCache = new ConcurrentHashMap<>();
    private final Map<String, Bucket> ipCache = new ConcurrentHashMap<>();
    private final Map<String, Bucket> loginCache = new ConcurrentHashMap<>();
    private final Map<String, Bucket> highCostCache = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String userId) {
        return cache.computeIfAbsent(userId, this::newBucket);
    }

    /** OTP send-code: max 3 requests per 15 minutes AND max 1 per minute. */
    public Bucket resolveOtpBucket(String email) {
        return otpCache.computeIfAbsent(email, this::newOtpBucket);
    }

    /** Global IP rate limit: 100 requests per minute */
    public Bucket resolveIpBucket(String ip) {
        return ipCache.computeIfAbsent(ip, this::newIpBucket);
    }

    /** Login attempts: max 5 requests per 15 minutes per IP or Email */
    public Bucket resolveLoginBucket(String identifier) {
        return loginCache.computeIfAbsent(identifier, this::newLoginBucket);
    }

    /** High cost / AI endpoints: max 10 requests per hour per IP */
    public Bucket resolveHighCostBucket(String ip) {
        return highCostCache.computeIfAbsent(ip, this::newHighCostBucket);
    }

    public String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private Bucket newBucket(String userId) {
        // Allows 5 applications per minute per user
        Bandwidth limit = Bandwidth.builder()
                .capacity(5)
                .refillIntervally(5, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket newOtpBucket(String email) {
        // Max 3 per 15 minutes
        Bandwidth limit1 = Bandwidth.builder()
                .capacity(3)
                .refillIntervally(3, Duration.ofMinutes(15))
                .build();
                
        // Max 1 per minute (~60s spacing)
        Bandwidth limit2 = Bandwidth.builder()
                .capacity(1)
                .refillIntervally(1, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(limit1)
                .addLimit(limit2)
                .build();
    }

    private Bucket newIpBucket(String ip) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(100)
                .refillIntervally(100, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket newLoginBucket(String identifier) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(5)
                .refillIntervally(5, Duration.ofMinutes(15))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private Bucket newHighCostBucket(String ip) {
        Bandwidth limit = Bandwidth.builder()
                .capacity(10)
                .refillIntervally(10, Duration.ofHours(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
