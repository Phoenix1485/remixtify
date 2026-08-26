FROM golang:1.26.6-alpine AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY cmd/changelog-api ./cmd/changelog-api
COPY internal/changelogapi ./internal/changelogapi
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/changelog-api ./cmd/changelog-api

FROM alpine:3.21
RUN apk add --no-cache ca-certificates && addgroup -S remixtify && adduser -S -G remixtify -h /nonexistent remixtify
COPY --from=build /out/changelog-api /usr/local/bin/changelog-api
USER remixtify
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/changelog-api"]
