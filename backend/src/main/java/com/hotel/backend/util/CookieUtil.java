package com.hotel.backend.util;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class CookieUtil {
    @Value("${cookie.secure:false}")
    private boolean secure;
    @Value("${jwt.refresh_time}")
    private long refreshTime;
    @Value("${cookie.same-site:Lax}")
    private String sameSite;

    private void cookieManagement(String refreshToken, long expiration, HttpServletResponse response){
        String effectiveSameSite = secure ? "None" : sameSite;
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .value(refreshToken)
                .maxAge(expiration)
                .httpOnly(true)
                .secure(secure)
                .sameSite(effectiveSameSite)
                .path("/")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE,cookie.toString());
    }
    public void addCookie(String refreshToken,HttpServletResponse response){
        cookieManagement(refreshToken,refreshTime/1000,response);
    }
    public void clearCookie(HttpServletResponse response){
        cookieManagement("",0,response);
    }
}
