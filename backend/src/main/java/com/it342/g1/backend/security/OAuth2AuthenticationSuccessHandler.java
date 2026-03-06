package com.it342.g1.backend.security;

import com.it342.g1.backend.dto.LoginResponse;
import com.it342.g1.backend.service.AuthenticationService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {
    private final AuthenticationService authenticationService;

    @Value("${app.frontend-base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    public OAuth2AuthenticationSuccessHandler(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
        throws IOException, ServletException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        LoginResponse loginResponse = authenticationService.loginWithGoogleUser(oauth2User);

        String redirectUrl = UriComponentsBuilder
            .fromUriString(frontendBaseUrl + "/oauth/callback")
            .queryParam("token", loginResponse.getToken())
            .queryParam("username", loginResponse.getUsername())
            .queryParam("email", loginResponse.getEmail())
            .queryParam("firstName", loginResponse.getFirstName())
            .queryParam("lastName", loginResponse.getLastName())
            .queryParam("role", loginResponse.getRole())
            .build()
            .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
