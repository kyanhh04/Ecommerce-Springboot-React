package com.phegondev.Phegon.Eccormerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class PhegonEccormerceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PhegonEccormerceApplication.class, args);
	}

}
