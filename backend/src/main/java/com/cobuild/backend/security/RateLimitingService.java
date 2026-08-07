package com.cobuild.backend.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitingService {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    private final Map<String, Bucket> otpCache = new ConcurrentHashMap<>();

    public Bucket resolveBucket(String userId) {
        return cache.computeIfAbsent(userId, this::newBucket);
    }

    /** OTP send-code: max 3 requests per email per 15 minutes. */
    public Bucket resolveOtpBucket(String email) {
        return otpCache.computeIfAbsent(email, this::newOtpBucket);
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
        Bandwidth limit = Bandwidth.builder()
                .capacity(3)
                .refillIntervally(3, Duration.ofMinutes(15))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }
}
