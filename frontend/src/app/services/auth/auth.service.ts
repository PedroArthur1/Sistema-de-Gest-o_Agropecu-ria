import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { getBrowserStorage } from '../../utils/browser-storage';

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
                    const storage = getBrowserStorage();
                    storage.setItem('jwt_token', response.token);
                    storage.setItem('user_role', response.role);
                    if (response.nome) {
                        storage.setItem('user_name', response.nome);
                    }
                }
            })
        );
    }

    register(userData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/register`, userData);
    }

    logout(): void {
      const storage = getBrowserStorage();
      storage.removeItem('jwt_token');
      storage.removeItem('user_role');
      storage.removeItem('user_name');
    }

    getToken(): string | null {
        return getBrowserStorage().getItem('jwt_token');
    }

    getRole(): string | null {
        return getBrowserStorage().getItem('user_role');
    }

    getUserName(): string | null {
        return getBrowserStorage().getItem('user_name');
    }

    isLoggedIn(): boolean {
        return !!this.getToken();
    }
}
