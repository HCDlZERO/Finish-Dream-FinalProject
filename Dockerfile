# ใช้ Maven เพื่อ build
FROM maven:3.8.4-openjdk-17 AS build
WORKDIR /app
COPY backend/pom.xml backend/
COPY backend/src/ backend/src/
RUN mvn -f backend/pom.xml clean package -DskipTests

# ใช้ JDK เพื่อ run app
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=build /app/backend/target/NamjaiBackend-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
