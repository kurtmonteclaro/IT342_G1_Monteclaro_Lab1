package com.example.mobile.model

data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String
)

data class LoginRequest(
    val username: String,
    val password: String
)

data class LoginResponse(
    val token: String,
    val username: String,
    val email: String,
    val firstName: String,
    val lastName: String
)

data class UserDto(
    val id: Long,
    val username: String,
    val email: String,
    val firstName: String,
    val lastName: String
)
