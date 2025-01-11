export class User {
    id: string;
    firstName: string;
    lastName: string;
    userName: string;
    email: string;

    constructor(id: string, firstName: string, lastName: string, userName: string, email: string) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.userName = userName;
        this.email = email;
    }
}