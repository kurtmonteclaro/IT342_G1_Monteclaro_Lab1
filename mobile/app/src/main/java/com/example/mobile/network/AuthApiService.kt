package com.example.mobile.network

import com.example.mobile.model.LoginRequest
import com.example.mobile.model.LoginResponse
import com.example.mobile.model.RegisterRequest
import com.example.mobile.model.UserDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST

interface AuthApiService {
    @POST("api/auth/register")
    suspend fun register(@Body body: RegisterRequest): Response<Unit>

    @POST("api/auth/login")
    suspend fun login(@Body body: LoginRequest): Response<LoginResponse>

    @GET("api/user/me")
    suspend fun me(@Header("Authorization") bearer: String): Response<UserDto>
}
