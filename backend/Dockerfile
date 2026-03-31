# 빌드 단계
#FROM gradle:9.3.1-jdk17 AS builder
#
#WORKDIR /app
#
#COPY build.gradle ./
#COPY settings.gradle ./
#
#RUN gradle dependencies --no-daemon
#
#COPY ./src ./src
#RUN gradle bootjar --no-daemon

# 실행 단계
FROM openjdk:17-ea-17-slim
#ARG JAR_FILE
#COPY --from=builder /app/build/libs/*.jar /app.jar
COPY ./build/libs/*.jar /app.jar
COPY keystore.p12 /app/keystore.p12
#COPY ${JAR_FILE} /app.jar
EXPOSE 8080
CMD ["java", "-jar", "/app.jar"]
