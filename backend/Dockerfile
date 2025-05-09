FROM maven:3.9.2-eclipse-temurin-17 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=builder /app/target/namjai-backend-1.0.0.jar app.jar
EXPOSE 8082 
ENTRYPOINT ["java", "-jar", "app.jar"]
