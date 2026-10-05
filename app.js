const ACCOUNT_KEY = "mhc_account";
const SESSION_KEY = "mhc_session";
const ADMIN_SESSION_KEY = "mhc_admin_session";
const DOCTOR_SESSION_KEY = "mhc_doctor_session";
const DOCTORS_KEY = "mhc_doctors";
const USERS_KEY = "mhc_users";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";

function getAccount() {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
}

function getDoctors() {
    return JSON.parse(localStorage.getItem(DOCTORS_KEY) || "[]");
}

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function setSession(isLoggedIn) {
    if (isLoggedIn) {
        localStorage.setItem(SESSION_KEY, "true");
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

function isLoggedIn() {
    return localStorage.getItem(SESSION_KEY) === "true" && Boolean(getAccount());
}

function setAdminSession(isLoggedIn) {
    if (isLoggedIn) {
        localStorage.setItem(ADMIN_SESSION_KEY, "true");
    } else {
        localStorage.removeItem(ADMIN_SESSION_KEY);
    }
}

function isAdminLoggedIn() {
    return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function setDoctorSession(doctor, isLoggedIn) {
    if (isLoggedIn) {
        localStorage.setItem(DOCTOR_SESSION_KEY, JSON.stringify(doctor));
    } else {
        localStorage.removeItem(DOCTOR_SESSION_KEY);
    }
}

function getDoctorSession() {
    return JSON.parse(localStorage.getItem(DOCTOR_SESSION_KEY) || "null");
}

function isDoctorLoggedIn() {
    return Boolean(getDoctorSession());
}

function showMessage(message, isError = true) {
    const messageBox = document.querySelector("#auth-message");

    if (!messageBox) return;

    messageBox.textContent = message;
    messageBox.classList.toggle("error", isError);
}

function clearAllSessions() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(DOCTOR_SESSION_KEY);
}

function setupLoginForm() {
    const loginForm = document.querySelector("#login-form");

    if (!loginForm) return;

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const email = String(formData.get("email")).trim().toLowerCase();
        const password = String(formData.get("password"));

        clearAllSessions();

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            setAdminSession(true);
            window.location.href = "admin.html";
            return;
        }

        const doctors = getDoctors();

        const doctor = doctors.find(function(record) {
            return (
                record.email === email &&
                (
                    record.password === password ||
                    (!record.password && password === "doctor123")
                )
            );
        });

        if (doctor) {
            setDoctorSession(doctor, true);
            window.location.href = "doctor-dashboard.html";
            return;
        }

        const account = getAccount();

        if (
            account &&
            account.email === email &&
            account.password === password
        ) {
            setSession(true);
            window.location.href = "index.html";
            return;
        }

        showMessage("Incorrect email or password.");
    });
}

function setupSignupForm() {
    const signupForm = document.querySelector("#signup-form");

    if (!signupForm) return;

    signupForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const formData = new FormData(signupForm);

        const account = {
            firstName: String(formData.get("first-name")).trim(),
            lastName: String(formData.get("last-name")).trim(),
            email: String(formData.get("email")).trim().toLowerCase(),
            phone: String(formData.get("phone")).trim(),
            age: String(formData.get("age")).trim(),
            bloodType: String(formData.get("blood-type")).trim(),
            condition: "N/A",
            password: String(formData.get("password")),
            role: "Patient"
        };

        localStorage.setItem(
            ACCOUNT_KEY,
            JSON.stringify(account)
        );

        const users = getUsers();

        if (!users.some(user => user.email === account.email)) {
            users.push({
                name: `${account.firstName} ${account.lastName}`,
                email: account.email,
                role: "Patient",
                department: "Patient Services",
                joined: new Date().toLocaleDateString(),
                lastActive: "Now",
                status: "Active"
            });

            localStorage.setItem(
                USERS_KEY,
                JSON.stringify(users)
            );
        }

        clearAllSessions();
        setSession(true);

        window.location.href = "login.html";
    });
}

function initializeDefaultDoctor() {
    const doctors = getDoctors();

    if (!doctors.some(doctor => doctor.email === "doctor@gmail.com")) {
        doctors.push({
            name: "Dr. Juan Dela Cruz",
            role: "Doctor",
            specialty: "General Medicine",
            email: "doctor@gmail.com",
            contact: "09123456789",
            password: "doctor123"
        });

        localStorage.setItem(
            DOCTORS_KEY,
            JSON.stringify(doctors)
        );
    }
}


function setupLogout() {
    document
        .querySelectorAll("[data-logout]")
        .forEach(function(logoutLink) {
            logoutLink.addEventListener("click", function(event) {
                event.preventDefault();

                setSession(false);

                window.location.href = "login.html";
            });
        });

    document
        .querySelectorAll("[data-admin-logout]")
        .forEach(function(logoutLink) {
            logoutLink.addEventListener("click", function(event) {
                event.preventDefault();

                setAdminSession(false);

                window.location.href = "login.html";
            });
        });

    document
        .querySelectorAll("[data-doctor-logout]")
        .forEach(function(logoutLink) {
            logoutLink.addEventListener("click", function(event) {
                event.preventDefault();

                setDoctorSession(null, false);

                window.location.href = "login.html";
            });
        });
}

function protectAdminPage() {
    if (
        document.querySelector(".admin-body") &&
        !isAdminLoggedIn()
    ) {
        window.location.href = "login.html";
    }
}

function protectDoctorPage() {
    if (
        document.querySelector(".doctor-body") &&
        !isDoctorLoggedIn()
    ) {
        window.location.href = "login.html";
    }
}

function protectPatientPage() {
    if (
        document.querySelector(".booking-form") &&
        !isLoggedIn()
    ) {
        window.location.href = "login.html";
    }
}


document.addEventListener("DOMContentLoaded", function() {
    initializeDefaultDoctor();
    setupLoginForm();
    setupSignupForm();
    setupLogout();
    protectAdminPage();
    protectDoctorPage();
    protectPatientPage();
});