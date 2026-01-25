package com.phegondev.Phegon.Eccormerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableScheduling
public class PaymentSecurityConfig {

   
    public static class OTPConfig {
        public static final int OTP_EXPIRY_MINUTES = 10;
        public static final int OTP_LENGTH = 6;
        public static final String OTP_ALGORITHM = "HmacSHA1";
    }

    public static class PaymentConfig {
        public static final String[] PAYMENT_METHODS = {
            "CREDIT_CARD",
            "DEBIT_CARD",
            "PAYPAL",
            "BANK_TRANSFER"
        };

        public static final int MAX_RETRY_ATTEMPTS = 3;
        public static final long PAYMENT_TIMEOUT_MINUTES = 30;
    }

    public static class EncryptionConfig {
        public static final String ALGORITHM = "AES";
        public static final String TRANSFORMATION = "AES";
        public static final int KEY_SIZE = 256;
    }
}
