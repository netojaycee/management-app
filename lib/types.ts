export interface ILogin {
    email: string;
    password: string;
}

export interface IRegister {
    name: string;
    email: string;
    password: string;
    department: string;
    role: string;
}

export interface IPermission {
    name: string;
    description?: string;

}