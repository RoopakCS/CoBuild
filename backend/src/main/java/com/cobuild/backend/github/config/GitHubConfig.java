package com.cobuild.backend.github.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class GitHubConfig {

    @Value("${cobuild.github.token:}")
    private String githubToken;

    @Value("${cobuild.github.api-url:https://api.github.com}")
    private String githubApiUrl;

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager("githubStats");
    }

    @Bean
    public RestClient gitHubRestClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(3000);

        RestClient.Builder builder = RestClient.builder()
                .baseUrl(githubApiUrl)
                .requestFactory(factory)
                .defaultHeader("User-Agent", "CoBuild-Application")
                .defaultHeader("Accept", "application/vnd.github.v3+json");

        if (githubToken != null && !githubToken.isBlank()) {
            builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + githubToken);
        }

        return builder.build();
    }
}
