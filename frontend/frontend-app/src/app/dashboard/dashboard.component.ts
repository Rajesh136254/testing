import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error = '';
  stats = {
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    totalMessages: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.fetchUsers();
    this.fetchStats();
  }

  fetchUsers() {
    this.http.get<User[]>('/api/users').subscribe({
      next: (response) => {
        this.users = response;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load users';
        this.loading = false;
        console.error('Error fetching users:', error);
      }
    });
  }

  fetchStats() {
    this.http.get<any>('/api/stats').subscribe({
      next: (response) => {
        this.stats = response;
      },
      error: (error) => {
        console.error('Error fetching stats:', error);
      }
    });
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.http.delete(`/api/users/${id}`).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== id);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  updateUserStatus(user: User) {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    this.http.patch(`/api/users/${user.id}`, { status: newStatus }).subscribe({
      next: () => {
        user.status = newStatus;
      },
      error: (error) => {
        console.error('Error updating user status:', error);
      }
    });
  }
}