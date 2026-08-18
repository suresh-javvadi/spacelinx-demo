# SpaceLinx API — container image for free hosting (Render / Railway / Fly.io).
#
# Build context must be this folder (src/SpaceLinx.Api) because it references both
# the SpaceLinx.Api and SpaceLinx.Model projects, which live side by side here.
#
# The app listens on the platform-provided $PORT (defaults to 8080 locally).
# Required env vars at runtime (set them in the hosting dashboard, NOT here):
#   PostgreSql__ConnectionString   your Neon connection string
#   DemoMode__Enabled              true   (no-login demo mode)
#   Cors__AllowedOrigins           https://your-frontend.vercel.app
# Optional:
#   ASPNETCORE_ENVIRONMENT         Development  (turns on Swagger UI at /swagger)

# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first (cached unless a .csproj changes)
COPY SpaceLinx.Api/SpaceLinx.Api.csproj SpaceLinx.Api/
COPY SpaceLinx.Model/SpaceLinx.Model.csproj SpaceLinx.Model/
RUN dotnet restore SpaceLinx.Api/SpaceLinx.Api.csproj

# Build + publish
COPY . .
RUN dotnet publish SpaceLinx.Api/SpaceLinx.Api.csproj \
    -c Release -o /app/publish /p:UseAppHost=false

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Demo default: Development so Swagger UI is available for testing.
# Override to Production in the hosting dashboard if you don't want Swagger.
ENV ASPNETCORE_ENVIRONMENT=Development
EXPOSE 8080

# Bind to the host's $PORT (Render/Railway inject it) or 8080 locally.
# Shell form so ${PORT} is expanded at container start.
CMD ASPNETCORE_URLS="http://+:${PORT:-8080}" dotnet SpaceLinx.Api.dll
