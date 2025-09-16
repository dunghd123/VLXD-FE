import { Routes } from '@angular/router';
import { LoginComponent } from './core/auth/components/login/login.component';
import { AuthGuard } from './core/auth/guards/auth.guard';
import { RoleGuard } from './core/auth/guards/role.guard';
import { Role } from './core/auth/models/auth.models';
import { ManagerLayoutComponent } from './layout/manager-layout/manager-layout.component';
import { EmployeeLayoutComponent } from './layout/employee-layout/employee-layout.component';
import { ManagerDashboardComponent } from './features/manager/manager-dashboard/manager-dashboard.component';
import { EmployeeDashboardComponent } from './features/employee/employee-dashboard/employee-dashboard.component';
import { UsersComponent } from './features/manager/users/users.component';
import { ProductsComponent as ManagerProductsComponent } from './features/manager/products/products.component';
import { CategoriesComponent } from './features/manager/categories/categories.component';
import { SuppliersComponent } from './features/manager/suppliers/suppliers.component';
import { CustomersComponent as ManagerCustomersComponent } from './features/manager/customers/customers.component';
import { OrdersComponent as ManagerOrdersComponent } from './features/manager/orders/orders.component';
import { ReportsComponent } from './features/manager/reports/reports.component';
import { ProductsComponent as EmployeeProductsComponent } from './features/employee/products/products.component';
import { CustomersComponent as EmployeeCustomersComponent } from './features/employee/customers/customers.component';
import { OrdersComponent as EmployeeOrdersComponent } from './features/employee/orders/orders.component';
import { InputOrdersComponent } from './features/employee/input-orders/input-orders.component';
import { OutputOrdersComponent } from './features/employee/output-orders/output-orders.component';
import { ProductPriceHistoryComponent } from './features/manager/product-price-history/price-history.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  
  // Manager routes
  {
    path: 'manager',
    component: ManagerLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.MANAGER] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ManagerDashboardComponent },
      // Manager features routes
      { 
        path: 'users', 
        component: UsersComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.MANAGER] }
      },
      { 
        path: 'products', 
        component: ManagerProductsComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.MANAGER] }
      },
      { 
        path: 'categories', 
        component: CategoriesComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.MANAGER] }
      },
      { 
        path: 'suppliers', 
        component: SuppliersComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.MANAGER] }
      },
      { 
        path: 'customers', 
        component: ManagerCustomersComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.MANAGER] }
      },
      { 
        path: 'orders', 
        component: ManagerOrdersComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.MANAGER] }
      },
      { 
        path: 'reports', 
        component: ReportsComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.MANAGER] }
      },
      {
        path: 'product-price-history',
        component: ProductPriceHistoryComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.MANAGER] }
      }
    ]
  },

  // Employee routes
  {
    path: 'employee',
    component: EmployeeLayoutComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: [Role.EMPLOYEE] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EmployeeDashboardComponent },
      // Employee features routes
      { 
        path: 'products', 
        component: EmployeeProductsComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.EMPLOYEE] }
      },
      { 
        path: 'customers', 
        component: EmployeeCustomersComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.EMPLOYEE] }
      },
      { 
        path: 'orders', 
        component: EmployeeOrdersComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.EMPLOYEE] }
      },
      { 
        path: 'input-orders', 
        component: InputOrdersComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.EMPLOYEE] }
      },
      { 
        path: 'output-orders', 
        component: OutputOrdersComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.EMPLOYEE] }
      }
    ]
  },
  
  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
