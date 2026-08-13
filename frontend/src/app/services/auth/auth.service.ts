import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, finalize } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:8080/auth';

    constructor(private http: HttpClient) { }

    login(credentials: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                if (response.token) {
                    localStorage.setItem('jwt_token', response.token);
                    localStorage.setItem('user_role', response.role);
                }
            })
        );
    }

    register(userData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/register`, userData);
    }

    logout(): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
            finalize(() => {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user_role');
            })
        );
    }

    getToken(): string | null {
        return localStorage.getItem('jwt_token');
    }

    getRole(): string | null {
        return localStorage.getItem('user_role');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}