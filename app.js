const ACCOUNT_KEY = "mhc_account";
const SESSION_KEY = "mhc_session";
const ADMIN_SESSION_KEY = "mhc_admin_session";
const DOCTOR_SESSION_KEY = "mhc_doctor_session";
const DOCTORS_KEY = "mhc_doctors";
const USERS_KEY = "mhc_users";
const APPOINTMENTS_KEY = "mhc_appointments";

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";
const DEFAULT_DOCTOR_EMAIL = "doctor@gmail.com";
const DEFAULT_DOCTOR_PASSWORD = "doctor123";

function getAccount() {
    return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
}

function getDoctors() {
    return JSON.parse(localStorage.getItem(DOCTORS_KEY) || "[]");
}

function saveDoctors(doctors) {
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
}

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getAppointments() {
    return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || "[]");
}

function saveAppointments(appointments) {
    localStorage.setItem(
        APPOINTMENTS_KEY,
        JSON.stringify(appointments)
    );
}

function setSession(isLoggedIn) {
    if (isLoggedIn) {
        localStorage.setItem(SESSION_KEY, "true");
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}

function isLoggedIn() {
    return (
        localStorage.getItem(SESSION_KEY) === "true" &&
        Boolean(getAccount())
    );
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
        localStorage.setItem(
            DOCTOR_SESSION_KEY,
            JSON.stringify(doctor)
        );
    } else {
        localStorage.removeItem(DOCTOR_SESSION_KEY);
    }
}

function getDoctorSession() {
    return JSON.parse(
        localStorage.getItem(DOCTOR_SESSION_KEY) || "null"
    );
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

function initializeDefaultDoctor() {
    const doctors = getDoctors();

    const existingDoctor = doctors.find(function(doctor) {
        return doctor.email === DEFAULT_DOCTOR_EMAIL;
    });

    if (!existingDoctor) {
        doctors.push({
            id: "DOC-001",
            name: "Dr. Juan Dela Cruz",
            role: "Doctor",
            specialty: "General Medicine",
            email: DEFAULT_DOCTOR_EMAIL,
            contact: "09123456789",
            password: DEFAULT_DOCTOR_PASSWORD
        });

        saveDoctors(doctors);
    } else {
        existingDoctor.password =
            existingDoctor.password || DEFAULT_DOCTOR_PASSWORD;

        existingDoctor.role =
            existingDoctor.role || "Doctor";

        existingDoctor.name =
            existingDoctor.name || "Dr. Juan Dela Cruz";

        saveDoctors(doctors);
    }
}

function setupLoginForm() {
    const loginForm = document.querySelector("#login-form");

    if (!loginForm) return;

    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const formData = new FormData(loginForm);

        const email = String(
            formData.get("email") || ""
        ).trim().toLowerCase();

        const password = String(
            formData.get("password") || ""
        );

        clearAllSessions();

        if (
            email === ADMIN_EMAIL &&
            password === ADMIN_PASSWORD
        ) {
            setAdminSession(true);
            window.location.href = "admin.html";
            return;
        }

        const doctors = getDoctors();

        const doctor = doctors.find(function(record) {
            return (
                String(record.email || "").toLowerCase() === email &&
                String(
                    record.password || DEFAULT_DOCTOR_PASSWORD
                ) === password
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
            String(account.email || "").toLowerCase() === email &&
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

        const password = String(formData.get("password"));
        const confirmPassword = String(formData.get("confirm-password"));

        if (password !== confirmPassword) {
            showMessage("Passwords do not match.");
            return;
        }

        const account = {
            firstName: String(formData.get("first-name")).trim(),
            lastName: String(formData.get("last-name")).trim(),
            email: String(formData.get("email")).trim().toLowerCase(),
            phone: String(formData.get("phone")).trim(),
            age: String(formData.get("age")).trim(),
            bloodType: String(formData.get("blood-type")).trim(),
            condition: "N/A",
            password: password,
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

        window.location.href = "login.html";
    });
}
function setupBookingForm() {
    const bookingForm =
        document.querySelector(".booking-form");

    if (!bookingForm) return;

    const account = getAccount();

    if (!account || !isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    const patientInput =
        bookingForm.querySelector('[name="patient"]');

    const contactInput =
        bookingForm.querySelector('[name="contact"]');

    const emailInput =
        bookingForm.querySelector('[name="email"]');

    if (patientInput) {
        patientInput.value =
            (
                account.firstName +
                " " +
                account.lastName
            ).trim();
    }

    if (contactInput) {
        contactInput.value =
            account.phone || "";
    }

    if (emailInput) {
        emailInput.value =
            account.email || "";
    }

    setupDoctorChoices();

    const dateInput =
        bookingForm.querySelector('[name="date"]');

    if (dateInput) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");
        const day = String(
            today.getDate()
        ).padStart(2, "0");

        dateInput.min =
            year + "-" + month + "-" + day;
    }

    bookingForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const formData =
            new FormData(bookingForm);

        const doctorEmail =
            String(
                formData.get("doctor-email") || ""
            ).trim().toLowerCase();

        const doctorName =
            String(
                formData.get("doctor-name") || ""
            ).trim();

        const date =
            String(
                formData.get("date") || ""
            ).trim();

        const time =
            String(
                formData.get("time") || ""
            ).trim();

        const service =
            String(
                formData.get("service") || ""
            ).trim();

        if (!doctorEmail || !doctorName) {
            showBookingMessage(
                "Please select a doctor.",
                true
            );
            return;
        }

        if (!date || !time || !service) {
            showBookingMessage(
                "Please complete all required fields.",
                true
            );
            return;
        }

        const selectedDate =
            new Date(date + "T00:00:00");

        const today =
            new Date();

        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            showBookingMessage(
                "Please select today or a future date.",
                true
            );
            return;
        }

        const appointments =
            getAppointments();

        const duplicate =
            appointments.some(function(appointment) {
                return (
                    appointment.doctorEmail ===
                        doctorEmail &&
                    appointment.date === date &&
                    appointment.time === time &&
                    appointment.status !==
                        "Cancelled"
                );
            });

        if (duplicate) {
            showBookingMessage(
                "That doctor is already booked for this date and time.",
                true
            );
            return;
        }

        const appointment = {
            id:
                "APT-" +
                Date.now(),

            patientId:
                account.id || "",

            patient:
                String(
                    formData.get("patient") || ""
                ).trim(),

            email:
                String(
                    formData.get("email") || ""
                ).trim().toLowerCase(),

            contact:
                String(
                    formData.get("contact") || ""
                ).trim(),

            age:
                account.age || "",

            bloodType:
                account.bloodType || "",

            condition:
                account.condition || "N/A",

            service:
                service,

            doctor:
                doctorName,

            doctorEmail:
                doctorEmail,

            date:
                date,

            time:
                time,

            reason:
                String(
                    formData.get("reason") || ""
                ).trim(),

            diagnosis:
                "",

            prescription:
                "",

            status:
                "Pending",

            createdAt:
                new Date().toISOString()
        };

        appointments.push(appointment);

        saveAppointments(appointments);

        bookingForm.reset();

        if (patientInput) {
            patientInput.value =
                (
                    account.firstName +
                    " " +
                    account.lastName
                ).trim();
        }

        if (contactInput) {
            contactInput.value =
                account.phone || "";
        }

        if (emailInput) {
            emailInput.value =
                account.email || "";
        }

        setupDoctorChoices();

        showBookingMessage(
            "Appointment request submitted successfully!",
            false
        );

        renderAllAppointmentPages();
    });
}

function setupDoctorChoices() {
    const select =
        document.querySelector("#doctor-choice");

    if (!select) return;

    const doctors =
        getDoctors();

    select.innerHTML =
        '<option value="">Select health personnel</option>';

    doctors.forEach(function(doctor) {
        const option =
            document.createElement("option");

        option.value =
            doctor.email;

        option.textContent =
            doctor.name +
            " - " +
            (doctor.specialty ||
                doctor.role ||
                "Medical Staff");

        option.dataset.email =
            doctor.email;

        option.dataset.name =
            doctor.name;

        select.appendChild(option);
    });

    select.addEventListener(
        "change",
        function() {
            const selected =
                select.options[
                    select.selectedIndex
                ];

            const form =
                select.closest("form");

            if (!form) return;

            let emailInput =
                form.querySelector(
                    '[name="doctor-email"]'
                );

            let nameInput =
                form.querySelector(
                    '[name="doctor-name"]'
                );

            if (!emailInput) {
                emailInput =
                    document.createElement("input");

                emailInput.type =
                    "hidden";

                emailInput.name =
                    "doctor-email";

                form.appendChild(
                    emailInput
                );
            }

            if (!nameInput) {
                nameInput =
                    document.createElement("input");

                nameInput.type =
                    "hidden";

                nameInput.name =
                    "doctor-name";

                form.appendChild(
                    nameInput
                );
            }

            emailInput.value =
                selected.dataset.email || "";

            nameInput.value =
                selected.dataset.name || "";
        }
    );
}

function showBookingMessage(
    message,
    isError
) {
    const box =
        document.querySelector(
            "#booking-message"
        );

    if (!box) {
        alert(message);
        return;
    }

    box.textContent =
        message;

    box.style.display =
        "block";

    box.style.color =
        isError
            ? "#c0392b"
            : "#16803c";
}

function formatDate(date) {
    if (!date) return "";

    const parts =
        date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return (
        parts[1] +
        "/" +
        parts[2] +
        "/" +
        parts[0]
    );
}

function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function statusClass(status) {
    return String(status || "")
        .toLowerCase()
        .replace(/\s+/g, "-");
}

function renderAdminDashboard() {
    const body =
        document.querySelector(
            "#appointments-body"
        );

    if (!body) return;

    const appointments =
        getAppointments();

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    const todayString =
        year + "-" + month + "-" + day;

    const todayAppointments =
        appointments.filter(function(appointment) {
            return (
                appointment.date ===
                todayString
            );
        });

    const completed =
        appointments.filter(function(appointment) {
            return appointment.status ===
                "Completed";
        });

    const pending =
        appointments.filter(function(appointment) {
            return appointment.status ===
                "Pending";
        });

    const scheduled =
        appointments.filter(function(appointment) {
            return appointment.status !==
                "Cancelled";
        });

    const todayCount =
        document.querySelector(
            "#today-appointments"
        );

    const totalCount =
        document.querySelector(
            "#total-appointments"
        );

    const pendingCount =
        document.querySelector(
            "#pending-appointments"
        );

    const completedCount =
        document.querySelector(
            "#completed-appointments"
        );

    const scheduledCount =
        document.querySelector(
            "#scheduled-count"
        );

    if (todayCount)
        todayCount.textContent =
            todayAppointments.length;

    if (totalCount)
        totalCount.textContent =
            appointments.length;

    if (pendingCount)
        pendingCount.textContent =
            pending.length;

    if (completedCount)
        completedCount.textContent =
            completed.length;

    if (scheduledCount)
        scheduledCount.textContent =
            scheduled.length +
            " scheduled";

    if (!todayAppointments.length) {
        body.innerHTML =
            '<tr><td colspan="8" class="empty-state">No appointments today.</td></tr>';

        return;
    }

    body.innerHTML =
        todayAppointments
            .map(function(appointment) {
                return 
                    <tr>
                        <td>${escapeHTML(appointment.patient)}</td>
                        <td>${escapeHTML(appointment.service)}</td>
                        <td>${escapeHTML(appointment.doctor)}</td>
                        <td>${escapeHTML(appointment.diagnosis || "-")}</td>
                        <td>${escapeHTML(appointment.prescription || "-")}</td>
                        <td>${escapeHTML(formatDate(appointment.date))}<br>${escapeHTML(appointment.time)}</td>
                        <td>${escapeHTML(appointment.contact)}</td>
                        <td>${escapeHTML(appointment.status)}</td>
                    </tr>
                ;
            })
            .join("");
}

function renderAllAppointments() {
    const body =
        document.querySelector(
            "#all-appointments-body"
        );

    if (!body) return;

    const appointments =
        getAppointments();

    if (!appointments.length) {
        body.innerHTML =
            '<tr><td colspan="9" class="empty-state">No appointments yet.</td></tr>';

        return;
    }

    body.innerHTML =
        appointments
            .slice()
            .reverse()
            .map(function(appointment) {
                return 
                    <tr>
                        <td>${escapeHTML(appointment.id)}</td>
                        <td>
                            <strong>${escapeHTML(appointment.patient)}</strong>
                            <br>
                            <small>${escapeHTML(appointment.email)}</small>
                        </td>
                        <td>
                            ${escapeHTML(appointment.doctor)}
                            <br>
                            <small>${escapeHTML(appointment.contact)}</small>
                        </td>
                        <td>${escapeHTML(appointment.diagnosis || "-")}</td>
                        <td>${escapeHTML(appointment.prescription || "-")}</td>
                        <td>
                            ${escapeHTML(formatDate(appointment.date))}
                            <br>
                            ${escapeHTML(appointment.time)}
                        </td>
                        <td>${escapeHTML(appointment.service)}</td>
                        <td>
                            <span class="status-${statusClass(appointment.status)}">
                                ${escapeHTML(appointment.status)}
                            </span>
                        </td>
                        <td>
                            ${getAdminAppointmentActions(appointment)}
                        </td>
                    </tr>
                ;
            })
            .join("");

    body
        .querySelectorAll(
            "[data-appointment-action]"
        )
        .forEach(function(button) {
            button.addEventListener(
                "click",
                function() {
                    updateAppointmentStatus(
                        button.dataset.id,
                        button.dataset.appointmentAction
                    );
                }
            );
        });
}

function getAdminAppointmentActions(
    appointment
) {
    if (appointment.status === "Completed") {
        return "Completed";
    }

    if (appointment.status === "Cancelled") {
        return "Cancelled";
    }

    return`
        <button type="button"
            data-appointment-action="Confirmed"
            data-id="${escapeHTML(appointment.id)}">
            Confirm
        </button>

        <button type="button"
            data-appointment-action="Cancelled"
            data-id="${escapeHTML(appointment.id)}">
            Cancel
        </button>
    `;
}

function updateAppointmentStatus(
    id,
    status
) {
    const appointments =
        getAppointments();

    const appointment =
        appointments.find(function(record) {
            return record.id === id;
        });

    if (!appointment) return;

    appointment.status =
        status;

    saveAppointments(
        appointments
    );

    renderAllAppointmentPages();
}

function renderDoctorDashboard() {
    const body =
        document.querySelector(
            "#doctor-appointments-body"
        );

    if (!body) return;

    const doctor =
        getDoctorSession();

    if (!doctor) return;

    const appointments =
        getAppointments();

    const doctorAppointments =
        appointments.filter(function(appointment) {
            return (
                String(
                    appointment.doctorEmail || ""
                ).toLowerCase() ===
                String(
                    doctor.email || ""
                ).toLowerCase()
            );
        });

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");

    const todayString =
        year + "-" + month + "-" + day;

    const todayCount =
        doctorAppointments.filter(
            function(appointment) {
                return (
                    appointment.date ===
                    todayString &&
                    appointment.status !==
                    "Cancelled"
                );
            }
        ).length;

    const completedCount =
        doctorAppointments.filter(
            function(appointment) {
                return (
                    appointment.status ===
                    "Completed"
                );
            }
        ).length;

    const cancelledCount =
        doctorAppointments.filter(
            function(appointment) {
                return (
                    appointment.status ===
                    "Cancelled"
                );
            }
        ).length;

    const todayElement =
        document.querySelector(
            "#doctor-today-count"
        );

    const completedElement =
        document.querySelector(
            "#doctor-completed-count"
        );

    const cancelledElement =
        document.querySelector(
            "#doctor-cancelled-count"
        );

    const scheduleElement =
        document.querySelector(
            "#doctor-schedule-count"
        );

    const nameElement =
        document.querySelector(
            "#selected-doctor-name"
        );

    if (todayElement)
        todayElement.textContent =
            todayCount;

    if (completedElement)
        completedElement.textContent =
            completedCount;

    if (cancelledElement)
        cancelledElement.textContent =
            cancelledCount;

    if (scheduleElement)
        scheduleElement.textContent =
            doctorAppointments.length +
            " scheduled";

    if (nameElement)
        nameElement.textContent =
            doctor.name || "Doctor";

    if (!doctorAppointments.length) {
        body.innerHTML =
            '<tr><td colspan="10" class="empty-state">No appointments yet.</td></tr>';

        return;
    }

    body.innerHTML =
        doctorAppointments
            .slice()
            .reverse()
            .map(function(appointment) {
                return `
                    <tr>
                        <td>${escapeHTML(appointment.patient)}</td>
                        <td>${escapeHTML(appointment.age || "-")}</td>
                        <td>${escapeHTML(appointment.bloodType || "-")}</td>
                        <td>${escapeHTML(appointment.condition || "-")}</td>
                        <td>${escapeHTML(appointment.service)}</td>
                        <td>
                            ${escapeHTML(formatDate(appointment.date))}
                            <br>
                            ${escapeHTML(appointment.time)}
                        </td>
                        <td>${escapeHTML(appointment.contact)}</td>
                        <td>${escapeHTML(appointment.diagnosis || "-")}</td>
                        <td>${escapeHTML(appointment.prescription || "-")}</td>
                        <td>
                            ${getDoctorAppointmentActions(appointment)}
                        </td>
                    </tr>
                `;
            })
            .join("");

    body
        .querySelectorAll(
            "[data-doctor-action]"
        )
        .forEach(function(button) {
            button.addEventListener(
                "click",
                function() {
                    updateAppointmentStatus(
                        button.dataset.id,
                        button.dataset.doctorAction
                    );
                }
            );
        });
}

function getDoctorAppointmentActions(
    appointment
) {
    if (appointment.status === "Completed") {
        return "Completed";
    }

    if (appointment.status === "Cancelled") {
        return "Cancelled";
    }

    return `
        <button type="button"
            data-doctor-action="Completed"
            data-id="${escapeHTML(appointment.id)}">
            Complete
        </button>

        <button type="button"
            data-doctor-action="Cancelled"
            data-id="${escapeHTML(appointment.id)}">
            Cancel
        </button>

    `;
}

function renderDoctorsPage() {
    const container =
        document.querySelector(
            "#doctors-body"
        );

    if (!container) return;

    const doctors =
        getDoctors();

    const count =
        document.querySelector(
            "#doctor-count"
        );

    if (count) {
        count.textContent =
            doctors.length +
            " staff on duty";
    }

    if (!doctors.length) {
        container.innerHTML =
            '<div class="empty-state">No doctors added yet.</div>';

        return;
    }

    container.innerHTML =
        doctors.map(function(doctor) {
            return
                <div class="doctor-card">
                    <h3>${escapeHTML(doctor.name)}</h3>
                    <p><strong>Role:</strong> ${escapeHTML(doctor.role || "Doctor")}</p>
                    <p><strong>Specialty:</strong> ${escapeHTML(doctor.specialty || "General Medicine")}</p>
                    <p><strong>Email:</strong> ${escapeHTML(doctor.email)}</p>
                    <p><strong>Contact:</strong> ${escapeHTML(doctor.contact || "-")}</p>
                    <p><strong>Password:</strong> ${escapeHTML(doctor.password || DEFAULT_DOCTOR_PASSWORD)}</p>
                </div>
            ;
        }).join("");
}

function setupDoctorForm() {
    const form =
        document.querySelector(
            "#doctor-form"
        );

    if (!form) return;

    form.addEventListener(
        "submit",
        function(event) {
            event.preventDefault();

            const formData =
                new FormData(form);

            const name =
                String(
                    formData.get("name") || ""
                ).trim();

            const role =
                String(
                    formData.get("role") || ""
                ).trim();

            const email =
                String(
                    formData.get("email") || ""
                ).trim().toLowerCase();

            const contact =
                String(
                    formData.get("contact") || ""
                ).trim();

            const doctors =
                getDoctors();

            if (
                doctors.some(function(doctor) {
                    return (
                        String(
                            doctor.email || ""
                        ).toLowerCase() ===
                        email
                    );
                })
            ) {
                showDoctorMessage(
                    "This email is already registered."
                );
                return;
            }

            const password =
                generateDoctorPassword();

            doctors.push({
                id:
                    "DOC-" +
                    Date.now(),

                name:
                    name,

                role:
                    role,

                specialty:
                    role === "Doctor"
                        ? "General Medicine"
                        : role,

                email:
                    email,

                contact:
                    contact,

                password:
                    password
            });

            saveDoctors(
                doctors
            );

            form.reset();

            showDoctorMessage(
                "Staff added successfully. Password: " +
                password
            );

            renderDoctorsPage();
        }
    );
}

function generateDoctorPassword() {
    return (
        "doctor" +
        Math.floor(
            1000 +
            Math.random() * 9000
        )
    );
}

function showDoctorMessage(
    message
) {
    const box =
        document.querySelector(
            "#doctor-message"
        );

    if (box) {
        box.textContent =
            message;
    } else {
        alert(message);
    }
}

function renderAdminCredentials() {
    if (!isAdminLoggedIn()) return;

    const existing =
        document.querySelector(
            "#admin-credentials-box"
        );

    if (existing) return;

    const box =
        document.createElement("div");

    box.id =
        "admin-credentials-box";

    box.innerHTML =
        <div>
            <strong>Administrator Account</strong>
            <p>Email: <span>${escapeHTML(ADMIN_EMAIL)}</span></p>
            <p>Password: <span>${escapeHTML(ADMIN_PASSWORD)}</span></p>
        </div>
    

    const target =
        document.querySelector(
            ".admin-welcome"
        ) ||
        document.querySelector(
            ".admin-content"
        );

    if (target) {
        target.prepend(box);
    }
}

function renderPatientInfo() {
    const account =
        getAccount();

    if (!account) return;

    document
        .querySelectorAll(
            "[data-patient-name]"
        )
        .forEach(function(element) {
            element.textContent =
                (
                    account.firstName +
                    " " +
                    account.lastName
                ).trim();
        });

    document
        .querySelectorAll(
            "[data-patient-email]"
        )
        .forEach(function(element) {
            element.textContent =
                account.email || "";
        });
}

function renderAllAppointmentPages() {
    renderAdminDashboard();
    renderAllAppointments();
    renderDoctorDashboard();
}

function setupLogout() {
    document
        .querySelectorAll("[data-logout]")
        .forEach(function(logoutLink) {
            logoutLink.addEventListener(
                "click",
                function(event) {
                    event.preventDefault();

                    setSession(false);

                    window.location.href =
                        "login.html";
                }
            );
        });

    document
        .querySelectorAll(
            "[data-admin-logout]"
        )
        .forEach(function(logoutLink) {
            logoutLink.addEventListener(
                "click",
                function(event) {
                    event.preventDefault();

                    setAdminSession(false);

                    window.location.href =
                        "login.html";
                }
            );
        });

    document
        .querySelectorAll(
            "[data-doctor-logout]"
        )
        .forEach(function(logoutLink) {
            logoutLink.addEventListener(
                "click",
                function(event) {
                    event.preventDefault();

                    setDoctorSession(
                        null,
                        false
                    );

                    window.location.href =
                        "login.html";
                }
            );
        });
}

function protectAdminPage() {
    if (
        document.querySelector(
            ".admin-body"
        ) &&
        !isAdminLoggedIn()
    ) {
        window.location.href =
            "login.html";
    }
}

function protectDoctorPage() {
    if (
        document.querySelector(
            ".doctor-body"
        ) &&
        !isDoctorLoggedIn()
    ) {
        window.location.href =
            "login.html";
    }
}

function protectPatientPage() {
    if (
        document.querySelector(
            ".booking-form"
        ) &&
        !isLoggedIn()
    ) {
        window.location.href =
            "login.html";
    }
}

document.addEventListener(
    "DOMContentLoaded",
    function() {
        initializeDefaultDoctor();

        setupLoginForm();
        setupSignupForm();
        setupBookingForm();
        setupDoctorForm();
        setupLogout();

        protectAdminPage();
        protectDoctorPage();
        protectPatientPage();

        renderAdminDashboard();
        renderAllAppointments();
        renderDoctorDashboard();
        renderDoctorsPage();
        renderAdminCredentials();
        renderPatientInfo();
    }
);

