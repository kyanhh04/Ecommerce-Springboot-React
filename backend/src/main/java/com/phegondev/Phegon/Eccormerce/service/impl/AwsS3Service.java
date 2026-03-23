package com.phegondev.Phegon.Eccormerce.service.impl;


import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import org.springframework.util.StringUtils;

@Service
@Slf4j
public class AwsS3Service {

    @Value("${aws.s3.bucket-name:}")
    private String bucketName;

    @Value("${aws.s3.access:}")
    private String awsS3AccessKey;

    @Value("${aws.s3.secrete:}")
    private String awsS3SecreteKey;

    @Value("${aws.s3.region:}")
    private String awsS3Region;


    public String saveImageToS3(MultipartFile photo){
        // Check if AWS S3 configuration is available
        if (!StringUtils.hasText(awsS3AccessKey) || !StringUtils.hasText(awsS3SecreteKey)
                || !StringUtils.hasText(bucketName) || !StringUtils.hasText(awsS3Region)) {
            log.warn("AWS S3 configuration is missing. Image upload to S3 is disabled.");
            return "S3_UPLOAD_DISABLED";
        }

        try {
            String s3FileName = photo.getOriginalFilename();
            log.info("Uploading file to S3: {} to bucket: {} in region: {}", s3FileName, bucketName, awsS3Region);

            //create aes credentials using the access and secrete key
            BasicAWSCredentials awsCredentials = new BasicAWSCredentials(awsS3AccessKey, awsS3SecreteKey);

            //create an s3 client with config credentials and region
            AmazonS3 s3Client = AmazonS3ClientBuilder.standard()
                    .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                    .withRegion(Regions.fromName(awsS3Region))
                    .build();

            //get input stream from photo
            InputStream inputStream = photo.getInputStream();

            //set metedata for the onject
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType("image/jpeg");
            metadata.setContentLength(photo.getSize());

            //create a put request to upload the image to s3
            PutObjectRequest putObjectRequest = new PutObjectRequest(bucketName, s3FileName, inputStream, metadata);
            s3Client.putObject(putObjectRequest);

            String imageUrl = "https://" + bucketName + ".s3." + awsS3Region + ".amazonaws.com/" + s3FileName;
            log.info("Successfully uploaded file to S3: {}", imageUrl);
            return imageUrl;

        }catch (IOException e){
            log.error("IOException while uploading to S3: {}", e.getMessage(), e);
            throw new RuntimeException("Unable to upload image to s3 bucket: " + e.getMessage());
        }catch (Exception e){
            log.error("Error uploading to S3: {}", e.getMessage(), e);
            throw new RuntimeException("Unable to upload image to s3 bucket: " + e.getMessage());
        }
    }
}
