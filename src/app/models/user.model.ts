export interface SignIn {
    email: string;
    password: string;
}

export interface SignUp extends SignIn {
    attributes?: UserAttributes;
}

export interface UserAttributes {
    email: string;
    given_name: string;
    family_name: string;
}