import axios from 'axios';
import type { LoginResponse, SignInInfo, SignUpInfo } from '../types';
import { API } from '../../../api';
import type { ApiResponse } from '../../../types';

export async function loginUser(request: SignInInfo): Promise<LoginResponse> {
  try {
    const url = API.auth.login;
    const response = await axios.post<LoginResponse>(url, request);
    const responseData = response.data;
    return responseData;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function registerUser(request: SignUpInfo): Promise<ApiResponse> {
  try {
    const url = API.auth.register;
    const formData = new FormData();
    formData.append('username', request.username);
    formData.append('email', request.email);
    formData.append('password', request.password);
    formData.append('fullname', request.fullname);
    formData.append('phone', request.phone);
    formData.append('isFarmer', String(request.isFarmer));
    formData.append('avatar', request.avatar);
    const response = await axios.post<ApiResponse>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const responseData = response.data;
    return responseData;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function forgotPassword(request: {
  email: string;
}): Promise<ApiResponse & { statusCode?: number }> {
  try {
    const url = API.auth.forgotPassword;
    const response = await axios.post<ApiResponse>(url, request);
    return { ...response.data, statusCode: response.status };
  } catch (error: any) {
    if (error.response?.status === 400) {
      return { ...error.response.data, statusCode: error.response.status };
    } else {
      throw error;
    }
  }
}

export async function verifyOtp(request: {
  email: string;
  otp: string;
}): Promise<ApiResponse & { resetToken?: string }> {
  try {
    const url = API.auth.verifyOtp;
    const response = await axios.post<ApiResponse & { resetToken?: string }>(
      url,
      request
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}

export async function resetPassword(request: {
  email: string;
  resetToken: string;
  newPassword: string;
}): Promise<ApiResponse> {
  try {
    const url = API.auth.resetPassword;
    const response = await axios.post<ApiResponse>(url, request);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      return error.response.data;
    } else {
      throw error;
    }
  }
}
