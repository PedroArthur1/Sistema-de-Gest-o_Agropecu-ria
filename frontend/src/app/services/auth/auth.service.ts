import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;

    constructor(private http: HttpClient) { }

    login(credentials: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                if (response.token) {
                    localStorage.setItem('jwt_token', response.token);
                    localStorage.setItem('user_role', response.role);
                    if (response.nome) {
                        localStorage.setItem('user_name', response.nome);
                    }
                }
            })
        );
    }

    register(userData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/register`, userData);
    }

    logout(): void {
      localStorage.removeItem('jwt_token');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_name');
    }

    getToken(): string | null {
        return localStorage.getItem('jwt_token');
    }

    getRole(): string | null {
        return localStorage.getItem('user_role');
    }

    getUserName(): string | null {
        return localStorage.getItem('user_name');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}
