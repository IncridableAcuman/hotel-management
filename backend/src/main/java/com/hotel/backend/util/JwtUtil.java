package com.hotel.backend.util;

import com.hotel.backend.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {
    @Value("${jwt.refresh_time}")
    private long refreshTime;
    @Value("${jwt.access_time}")
    private long accessTime;
    @Value("${jwt.secret}")
    private String secret;
    private SecretKey secretKey;
    public static  final String REFRESH_TOKEN="refresh";
    public static final String ACCESS_TOKEN="access";

    @PostConstruct
    public void init(){
        this.secretKey= Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
    private String createToken(UserEntity user,long tokenExpiration,String type){
        long currentMillis = System.currentTimeMillis();
        Date issueAt = new Date(currentMillis);
        Date expiration = new Date(currentMillis + tokenExpiration);
        Map<String,Object> claims = new HashMap<>();
        claims.put("id",user.getId());
        claims.put("type",type);
        if (user.getRole() != null && user.getRole().getType() != null){
            claims.put("role",user.getRole().getType().name());
        }

        return Jwts
                .builder()
                .setSubject(user.getEmail())
                .addClaims(claims)
                .signWith(secretKey)
                .setExpiration(expiration)
                .setIssuedAt(issueAt)
                .compact();
    }
    public String generateAccessToken(UserEntity user){
        return createToken(user,accessTime,ACCESS_TOKEN);
    }
    public String generateRefreshToken(UserEntity user){
        return createToken(user,refreshTime,REFRESH_TOKEN);
    }
    private Claims extractClaims(String token){
        return Jwts
                .parserBuilder()
                .setSigningKey(secretKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
    public String getSubject(String token){
        return extractClaims(token).getSubject();
    }
    public Date getExpiration(String token){
        return extractClaims(token).getExpiration();
    }
    public String getRole(String token){
        return extractClaims(token).get("role",String.class);
    }
    public String getTokenType(String token){
        return extractClaims(token).get("type",String.class);
    }

    public boolean isTokenExpired(String token){
        return getExpiration(token).before(new Date());
    }
    public boolean validateToken(String token){
        try {
            return !isTokenExpired(token) && getSubject(token) != null;
        } catch (JwtException e){
            return false;
        }
    }
}
