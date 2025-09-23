import { Routes } from '@angular/router';
import { FormComponent } from './components/form/form.component';
import { LoginComponent } from './components/login/login.component';
import { DenounceAdministratorComponent } from './components/denounce-administrator/denounce-administrator.component';
import { DenounceQueryComponent } from './components/denounce-query/denounce-query.component';
import { LoginGuard } from './guards/login.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
    {
        path: '',
        component: FormComponent
    },
    {
        path: 'login',
        component: LoginComponent,
        canActivate: [LoginGuard]
    },
    {
        path: 'admin',
        component: DenounceAdministratorComponent,
        canActivate: [AdminGuard]
    },
    {
        path: 'query',
        component: DenounceQueryComponent
    },
    {
        path: '**',
        redirectTo: '',
        pathMatch: 'full'
    }
];
