package com.phegondev.Phegon.Eccormerce.security;

import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

public class PaymentEncryption {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES";
    private static final int KEY_SIZE = 256;

    // Khóa bảo mật (trong thực tế, lưu trong biến môi trường)
    private static final String SECRET_KEY = "MySecurePaymentKey1234567890123";

    public static String encrypt(String data) throws Exception {
        SecretKey key = new SecretKeySpec(
                SECRET_KEY.getBytes(), 0,
                SECRET_KEY.getBytes().length,
                ALGORITHM
        );

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.ENCRYPT_MODE, key);

        byte[] encryptedData = cipher.doFinal(data.getBytes());
        return Base64.getEncoder().encodeToString(encryptedData);
    }

    public static String decrypt(String encryptedData) throws Exception {
        SecretKey key = new SecretKeySpec(
                SECRET_KEY.getBytes(), 0,
                SECRET_KEY.getBytes().length,
                ALGORITHM
        );

        Cipher cipher = Cipher.getInstance(TRANSFORMATION);
        cipher.init(Cipher.DECRYPT_MODE, key);

        byte[] decodedData = Base64.getDecoder().decode(encryptedData);
        byte[] decryptedData = cipher.doFinal(decodedData);
        return new String(decryptedData);
    }

    public static String maskCardNumber(String cardNumber) {
        if (cardNumber.length() < 4) {
            return "****";
        }
        return "*".repeat(cardNumber.length() - 4) + cardNumber.substring(cardNumber.length() - 4);
    }
}
