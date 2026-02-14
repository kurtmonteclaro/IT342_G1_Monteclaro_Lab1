package com.example.mobile.model

data class RegisterRequest(
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String
)

data class LoginRequest(
    val email: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val email: String,
    val firstName: String,
    val lastName: String
)

data class UserDto(
    val id: Long,
    val email: String,
    val firstName: String,
    val lastName: String
)
