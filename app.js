const ACCOUNT_KEY = "mhc_account";
const SESSION_KEY = "mhc_session";
const ADMIN_SESSION_KEY = "mhc_admin_session";
const DOCTOR_SESSION_KEY = "mhc_doctor_session";
const APPOINTMENTS_KEY = "mhc_appointments";
const DOCTORS_KEY = "mhc_doctors";
const RECORDS_KEY = "mhc_medical_records";
const USERS_KEY = "mhc_users";
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin123";
const DOCTOR_EMAIL = "doctor@gmail.com";
const DOCTOR_PASSWORD = "doctor123";

function getAccount() {
  return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || "null");
}

function getAppointments() {
  return JSON.parse(localStorage.getItem(APPOINTMENTS_KEY) || "[]");
}

function getDoctors() {
  return JSON.parse(localStorage.getItem(DOCTORS_KEY) || "[]");
}

function getMedicalRecords() {
  return JSON.parse(localStorage.getItem(RECORDS_KEY) || "[]");
}

function isAppointmentRecordFor(record, appointment) {
  return (
    record.type === "Appointment" &&
    record.patient === appointment.patient &&
    record.date === appointment.date &&
    (record.doctor || "Health personnel") ===
      (appointment.doctor || "Health personnel")
  );
}

function removeAppointmentRecord(appointment) {
  const records = getMedicalRecords();
  const remainingRecords = records.filter(
    (record) => !isAppointmentRecordFor(record, appointment),
  );
  if (remainingRecords.length !== records.length) {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(remainingRecords));
  }
}

function saveAppointmentRecord(appointment, updates = {}) {
  const records = getMedicalRecords();
  let record = records.find((item) => isAppointmentRecordFor(item, appointment));
  if (!record) {
    record = {
      patient: appointment.patient,
      type: "Appointment",
      doctor: appointment.doctor || "Health personnel",
      date: appointment.date,
      diagnosis: "Pending consultation",
      prescription: "To be determined after consultation",
    };
    records.push(record);
  }
  Object.assign(record, updates);
  localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
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

function setAdminSession(isLoggedIn) {
  if (isLoggedIn) {
    localStorage.setItem(ADMIN_SESSION_KEY, "true");
  } else {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

function setDoctorSession(doctor, isLoggedIn) {
  if (isLoggedIn) {
    localStorage.setItem(DOCTOR_SESSION_KEY, JSON.stringify(doctor));
  } else {
    localStorage.removeItem(DOCTOR_SESSION_KEY);
  }
}

function isLoggedIn() {
  return localStorage.getItem(SESSION_KEY) === "true" && Boolean(getAccount());
}

function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
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

function notify(options) {
  if (typeof window.Swal !== "undefined" && typeof window.Swal.fire === "function") {
    return window.Swal.fire(options);
  }
  window.alert([options.title, options.text].filter(Boolean).join("\\n\\n") || "Please continue.");
  return Promise.resolve({ isConfirmed: true });
}

function notifyAndGo(options, destination) {
  notify(options).then(() => {
    window.location.href = destination;
  });
}

const signupForm = document.getElementById("signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(signupForm);

    const firstName = String(formData.get("first-name") || "").trim();
    const lastName = String(formData.get("last-name") || "").trim();
    const email = String(formData.get("email") || "")
      .trim()
      .toLowerCase();
    const phone = String(formData.get("phone") || "").trim();
    const age = String(formData.get("age") || "");
    const bloodType = String(formData.get("blood-type") || "");
    const password = String(formData.get("password") || "");

    const message = document.querySelector("#auth-message");

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !age ||
      !bloodType ||
      !password
    ) {
      showMessage("Please complete all fields.");
      return;
    }

    try {
      const users = getUsers();
      const existingAccount = getAccount();

      const emailExists = users.some(
        (user) =>
          String(user.email || "")
            .trim()
            .toLowerCase() === email,
      );

      const legacyEmailExists =
        existingAccount &&
        String(existingAccount.email || "")
          .trim()
          .toLowerCase() === email;

      if (
        emailExists ||
        legacyEmailExists ||
        email === ADMIN_EMAIL ||
        email === DOCTOR_EMAIL
      ) {
        if (typeof window.Swal !== "undefined" && typeof window.Swal.fire === "function") {
          window.Swal.fire({
            icon: "warning",
            title: "Email Already Registered!",
            text: "This email is already in use.",
            showCancelButton: true,
            confirmButtonText: "Log In",
            cancelButtonText: "Use Another Email",
          }).then((result) => {
            if (result.isConfirmed) window.location.href = "login.html";
          });
        } else {
          showMessage("This email is already registered. Please log in or use another email.");
        }
        return;
      }

      const account = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        email,
        phone,
        age,
        bloodType,
        condition: "N/A",
        password,
        role: "Patient",
        department: "Patient Services",
        joined: new Date().toLocaleDateString(),
        lastActive: "Now",
        status: "Active",
      };

      users.push(account);

      localStorage.setItem(USERS_KEY, JSON.stringify(users));

      if (message) {
        message.classList.remove("error");
        message.textContent =
          "Account created successfully! Redirecting to login...";
      }

      signupForm.reset();

      notifyAndGo({
        title: "Account Created!",
        text: "Your patient account has been saved. You can now log in.",
        icon: "success",
        confirmButtonText: "Continue",
      }, "login.html");
    } catch (error) {
      console.error("Signup error:", error);

      if (typeof Swal !== "undefined") {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Unable to save the account. Please try again.",
          footer: '<a href="#">Why do I have this issue?</a>',
        });
      } else {
        showMessage("Unable to save the account. Please try again.");
      }
    }
  });
}

function setupAuthForms() {
  const loginForm = document.querySelector("#login-form");

  if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const formData = new FormData(loginForm);
      const email = String(formData.get("email") || "")
        .trim()
        .toLowerCase();
      const password = String(formData.get("password") || "");

      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        setSession(false);
        setDoctorSession(false);
        setAdminSession(true);

        notifyAndGo({
          title: "Admin login successful",
          text: "Welcome to the clinic administration dashboard.",
          icon: "success",
          confirmButtonText: "Continue",
        }, "../admin/index.html");

        return;
      }

      if (email === DOCTOR_EMAIL && password === DOCTOR_PASSWORD) {
        setSession(false);
        setAdminSession(false);
        setDoctorSession(false);

        const doctor = {
          name: "Jhone Lantaca Sia",
          email: DOCTOR_EMAIL,
          role: "General Medicine",
          specialty: "General Medicine",
        };

        setDoctorSession(doctor, true);

        notifyAndGo({
          title: "Doctor login successful",
          text: "Welcome to the doctor dashboard.",
          icon: "success",
          confirmButtonText: "Continue",
        }, "../doctor/dashboard.html");

        return;
      }

      const users = getUsers();

      const staffAccount = users.find(
        (user) =>
          String(user.email || "").trim().toLowerCase() === email &&
          user.password === password &&
          ["doctor", "nurse", "midwife"].includes(String(user.role || "").toLowerCase()),
      );
      if (staffAccount) {
        setSession(false);
        setAdminSession(false);
        const doctor = {
          name: staffAccount.name,
          email: staffAccount.email,
          role: staffAccount.role,
          specialty: staffAccount.department || staffAccount.role,
        };
        setDoctorSession(doctor, true);
        notifyAndGo({
          title: "Staff login successful",
          text: "Welcome, " + staffAccount.name + ".",
          icon: "success",
          confirmButtonText: "Continue",
        }, "../doctor/dashboard.html");
        return;
      }

      const account = users.find(
        (user) =>
          String(user.email || "")
            .trim()
            .toLowerCase() === email &&
          user.password === password &&
          String(user.role || "Patient").toLowerCase() === "patient",
      );

      const oldAccount = getAccount();

      const matchedOldAccount =
        !account &&
        oldAccount &&
        String(oldAccount.email || "")
          .trim()
          .toLowerCase() === email &&
        oldAccount.password === password;

      const patientAccount = account || (matchedOldAccount ? oldAccount : null);

      if (patientAccount) {
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify(patientAccount));

        setSession(true);
        setAdminSession(false);
        setDoctorSession(null, false);

        notifyAndGo({
          title: "Login successful!",
          text: "Welcome back, " + (patientAccount.name || "Patient") + "!",
          icon: "success",
          confirmButtonText: "Continue",
        }, "index.html");

        return;
      }

      showMessage("Incorrect email or password. Please check your credentials.");
    });
  }
}

function setupLogout() {
  document.querySelectorAll("[data-logout]").forEach((logoutLink) => {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();

      notify({
        title: "Are you sure?",
        text: "Do you really want to log out?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, log out!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          setSession(false);
          window.location.href = "../client/login.html";
        }
      });
    });
  });

  document.querySelectorAll("[data-admin-logout]").forEach((logoutLink) => {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();

      notify({
        title: "Are you sure?",
        text: "Do you want to log out of your admin account?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, log out!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          setAdminSession(false);
          window.location.href = "../client/login.html";
        }
      });
    });
  });

  document.querySelectorAll("[data-doctor-logout]").forEach((logoutLink) => {
    logoutLink.addEventListener("click", (event) => {
      event.preventDefault();

      notify({
        title: "Are you sure?",
        text: "Do you want to log out of your doctor account?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, log out!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          setDoctorSession(false);
          window.location.href = "../client/login.html";
        }
      });
    });
  });
}

function setupProfileMenu() {
  const profileToggle = document.querySelector("[data-profile-toggle]");
  const profileWrap = document.querySelector(".admin-profile-wrap");
  if (!profileToggle || !profileWrap) return;

  profileToggle.addEventListener("click", () => {
    const isOpen = profileWrap.classList.toggle("open");
    profileToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

function protectAdminPage() {
  if (document.querySelector(".admin-body") && !isAdminLoggedIn()) {
    window.location.href = "../client/login.html";
  }
}

function protectDoctorPage() {
  if (document.querySelector(".doctor-body") && !isDoctorLoggedIn()) {
    window.location.href = "../client/login.html";
  }
}

function protectBookingPage() {
  if (document.querySelector(".booking-form") && !isLoggedIn()) {
    window.location.href = "../client/login.html";
    return;
  }

  const account = getAccount();
  const nameField = document.querySelector('input[name="patient"]');
  const contactField = document.querySelector('input[name="contact"]');
  const emailField = document.querySelector('input[name="email"]');
  if (account && nameField && !nameField.value)
    nameField.value = `${account.firstName} ${account.lastName}`;
  if (account && contactField && !contactField.value)
    contactField.value = account.phone;
  if (account && emailField && !emailField.value)
    emailField.value = account.email;
}

function setupBookingForm() {
  const bookingForm = document.querySelector(".booking-form");
  if (!bookingForm) return;
  const doctorChoice = document.querySelector("#doctor-choice");
  if (doctorChoice) {
    doctorChoice.disabled = false;
    const existingValues = new Set(Array.from(doctorChoice.options, (option) => option.value));
    getDoctors().forEach((doctor) => {
      if (doctor.name && !existingValues.has(doctor.name)) {
        const option = document.createElement("option");
        option.value = doctor.name;
        option.textContent = doctor.name + (doctor.specialty ? " — " + doctor.specialty : "");
        doctorChoice.appendChild(option);
        existingValues.add(doctor.name);
      }
    });
  }

  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(bookingForm);
    const account = getAccount() || {};
    const appointment = {
      patient: String(formData.get("patient")),
      contact: String(formData.get("contact")),
      email: String(formData.get("email")),
      service: String(formData.get("service")),
      doctor: String(formData.get("doctor")),
      date: String(formData.get("date")),
      time: String(formData.get("time")),
      reason: String(formData.get("reason") || ""),
      age: account.age || "N/A",
      bloodType: account.bloodType || "N/A",
      condition: account.condition || "N/A",
      status: "Pending",
    };
    const appointments = getAppointments();
    appointments.push(appointment);
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    saveAppointmentRecord(appointment);
    bookingForm.reset();
    const bookingMessage = document.querySelector("#booking-message");
    if (bookingMessage)
      bookingMessage.textContent =
        "Appointment request submitted successfully.";
  });
}

function renderAdminAppointments() {
  const tableBody = document.querySelector("#appointments-body");
  if (!tableBody) return;
  const appointments = getAppointments();
  const medicalRecords = getMedicalRecords();
  const total = document.querySelector("#total-appointments");
  const pending = document.querySelector("#pending-appointments");
  const completed = document.querySelector("#completed-appointments");
  const today = document.querySelector("#today-appointments");
  const scheduled = document.querySelector("#scheduled-count");
  if (total) total.textContent = appointments.length;
  if (pending)
    pending.textContent = appointments.filter(
      (appointment) => appointment.status === "Pending",
    ).length;
  if (completed)
    completed.textContent = appointments.filter(
      (appointment) => appointment.status === "Completed",
    ).length;
  const todayAppointments = appointments.filter(
    (appointment) =>
      appointment.date === new Date().toISOString().split("T")[0],
  ).length;
  if (today) today.textContent = todayAppointments;
  if (scheduled) scheduled.textContent = `${todayAppointments} scheduled`;

  if (!appointments.length) return;
  tableBody.innerHTML = appointments
    .map((appointment, index) => {
      const record = medicalRecords.find(
        (item) =>
          item.patient === appointment.patient &&
          item.date === appointment.date &&
          item.doctor === appointment.doctor,
      );
      return `<tr><td><strong>${appointment.patient}</strong><br><small>${appointment.email}</small></td><td>${appointment.service}</td><td>${appointment.doctor || "N/A"}</td><td>${record?.diagnosis || "Pending consultation"}</td><td>${record?.prescription || "To be determined"}</td><td>${appointment.date}<br>${appointment.time}</td><td>${appointment.contact}</td><td><button class="complete-button ${appointment.status === "Completed" ? "completed" : ""}" data-appointment-index="${index}" type="button">${appointment.status}</button></td></tr>`;
    })
    .join("");
}

function setupStatusChanges() {
  const tableBody = document.querySelector("#appointments-body");
  if (!tableBody) return;

  tableBody.addEventListener("click", (event) => {
    const completeButton = event.target.closest(".complete-button");
    if (!completeButton) return;
    const appointments = getAppointments();
    const appointment =
      appointments[Number(completeButton.dataset.appointmentIndex)];
    if (!appointment) return;
    appointment.status =
      appointment.status === "Completed" ? "Pending" : "Completed";
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    renderAdminAppointments();
  });
}

function renderPatients() {
  const patientsBody = document.querySelector("#patients-body");
  if (!patientsBody) return;
  const searchInput = document.querySelector("#patient-search");
  const appointments = getAppointments();
  const patients = appointments.reduce((records, appointment) => {
    const key = appointment.email.toLowerCase();
    const existing = records.find((patient) => patient.key === key);
    if (existing) {
      existing.age = appointment.age || existing.age;
      existing.bloodType = appointment.bloodType || existing.bloodType;
      existing.condition = appointment.condition || existing.condition;
      existing.lastVisit = appointment.date;
      return records;
    }
    records.push({
      key,
      id: `P-${String(records.length + 1).padStart(3, "0")}`,
      name: appointment.patient,
      email: appointment.email,
      contact: appointment.contact,
      age: appointment.age || "N/A",
      bloodType: appointment.bloodType || "N/A",
      condition: appointment.condition || "N/A",
      lastVisit: appointment.date,
      status: "Active",
    });
    return records;
  }, []);

  const renderRows = (query = "") => {
    const filteredPatients = patients.filter((patient) =>
      `${patient.name} ${patient.email}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
    if (!filteredPatients.length) {
      patientsBody.innerHTML = `<tr><td colspan="7" class="empty-state">${patients.length ? "No patients match your search." : "No patient records yet."}</td></tr>`;
      return;
    }
    patientsBody.innerHTML = filteredPatients
      .map(
        (patient) =>
          `<tr><td class="patient-id">${patient.id}</td><td class="patient-name"><strong>${patient.name}</strong><small>${patient.email}</small></td><td>${patient.age}</td><td>${patient.bloodType}</td><td>${patient.condition}</td><td>${patient.lastVisit}</td><td><span class="patient-status">${patient.status}</span></td></tr>`,
      )
      .join("");
  };

  renderRows();
  if (searchInput)
    searchInput.addEventListener("input", () => renderRows(searchInput.value));
}

function renderAllAppointments(filter = "All") {
  const tableBody = document.querySelector("#all-appointments-body");
  if (!tableBody) return;
  const appointments = getAppointments();
  const filteredAppointments =
    filter === "All"
      ? appointments
      : appointments.filter((appointment) => appointment.status === filter);
  if (!filteredAppointments.length) {
    tableBody.innerHTML = `<tr><td colspan="9" class="empty-state">No ${filter === "All" ? "appointments" : filter.toLowerCase() + " appointments"} yet.</td></tr>`;
    return;
  }
  tableBody.innerHTML = filteredAppointments
    .map((appointment, index) => {
      const statusClass = appointment.status.toLowerCase();
      const appointmentId = `APT-${String(index + 1).padStart(4, "0")}`;
      const record = getMedicalRecords().find(
        (item) =>
          item.patient === appointment.patient &&
          item.date === appointment.date &&
          item.doctor === appointment.doctor,
      );
      return `<tr><td class="appointment-id">${appointmentId}</td><td><strong>${appointment.patient}</strong><br><small>${appointment.email}</small></td><td>${appointment.doctor || "N/A"}<br><small>${appointment.contact}</small></td><td>${record?.diagnosis || "Pending consultation"}</td><td>${record?.prescription || "To be determined"}</td><td>${appointment.date}<br>${appointment.time}</td><td class="appointment-type">${appointment.service}</td><td><span class="appointment-status ${statusClass}">${appointment.status}</span></td><td>${appointment.status === "Cancelled" ? "-" : `<button class="cancel-appointment" type="button" data-cancel-index="${appointments.indexOf(appointment)}">Cancel</button>`}</td></tr>`;
    })
    .join("");
}

function setupAppointmentPage() {
  const tableBody = document.querySelector("#all-appointments-body");
  const filterButtons = document.querySelectorAll("[data-filter]");
  if (!tableBody || !filterButtons.length) return;
  let activeFilter = "All";
  renderAllAppointments(activeFilter);
  filterButtons.forEach((button) =>
    button.addEventListener("click", () => {
      activeFilter = button.dataset.filter;
      filterButtons.forEach((filterButton) =>
        filterButton.classList.toggle("active", filterButton === button),
      );
      renderAllAppointments(activeFilter);
    }),
  );
  tableBody.addEventListener("click", (event) => {
    const cancelButton = event.target.closest("[data-cancel-index]");
    if (!cancelButton) return;
    const appointments = getAppointments();
    const appointment = appointments[Number(cancelButton.dataset.cancelIndex)];
    if (!appointment) return;
    appointment.status = "Cancelled";
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    removeAppointmentRecord(appointment);
    renderAllAppointments(activeFilter);
  });
}

function setupDoctorPage() {
  const doctorForm = document.querySelector("#doctor-form");
  const doctorsBody = document.querySelector("#doctors-body");
  if (!doctorForm || !doctorsBody) return;
  const formPanel = document.querySelector("#doctor-form-panel");
  const addDoctorToggle = document.querySelector("#add-doctor-toggle");
  if (addDoctorToggle && formPanel) {
    addDoctorToggle.addEventListener("click", () =>
      formPanel.classList.toggle("open"),
    );
  }

  const renderDoctors = () => {
    const doctors = getDoctors();
    const doctorCount = document.querySelector("#doctor-count");
    if (doctorCount)
      doctorCount.textContent = `${doctors.length} staff member${doctors.length === 1 ? "" : "s"} on duty`;
    if (!doctors.length) {
      doctorsBody.innerHTML = `<div class="empty-state">No doctors added yet.</div>`;
      return;
    }
    const appointments = getAppointments();
    doctorsBody.innerHTML = doctors
      .map((doctor, index) => {
        const patientCount = new Set(
          appointments
            .filter((appointment) => appointment.doctor === doctor.name)
            .map((appointment) => appointment.email),
        ).size;
        const initials = doctor.name
          .replace("Dr. ", "")
          .split(" ")
          .map((part) => part[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();
        return `<article class="doctor-card"><div class="doctor-card-head"><img class="doctor-avatar" src="logo.jpg" alt="${doctor.name} profile placeholder"><div><h2>${doctor.name}</h2><p class="specialty">${doctor.role || doctor.specialty}</p><p class="credentials">Medical Staff</p></div></div><div class="doctor-metrics"><div><strong>${patientCount}</strong><span>Patients</span></div><div><strong>--</strong><span>Experience</span></div><div><strong>--</strong><span>Rating</span></div></div><div class="doctor-card-footer"><span>Available for booking</span><button class="remove-staff-button" type="button" data-remove-staff="${index}">Remove</button></div></article>`;
      })
      .join("");
  };

  doctorsBody.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-staff]");
    if (!removeButton) return;
    const doctors = getDoctors();
    const removedDoctor = doctors[Number(removeButton.dataset.removeStaff)];
    if (
      !removedDoctor ||
      !window.confirm(`Remove ${removedDoctor.name} from staff?`)
    )
      return;
    doctors.splice(Number(removeButton.dataset.removeStaff), 1);
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
    renderDoctors();
  });

  doctorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(doctorForm);
    const doctors = getDoctors();
    doctors.push({
      name: String(formData.get("name")).trim(),
      role: String(formData.get("role")).trim(),
      specialty: String(formData.get("role")).trim(),
      email: String(formData.get("email")).trim().toLowerCase(),
      contact: String(formData.get("contact")).trim(),
    });
    localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
    doctorForm.reset();
    const message = document.querySelector("#doctor-message");
    if (message) message.textContent = "Doctor added successfully.";
    if (formPanel) formPanel.classList.remove("open");
    renderDoctors();
  });

  renderDoctors();
}

function setupDoctorDashboard() {
  const doctorSelect = document.querySelector("#doctor-select");
  const appointmentsBody = document.querySelector("#doctor-appointments-body");
  if (!appointmentsBody) return;

  const doctors = getDoctors();
  const sessionDoctor = getDoctorSession();
  if (doctorSelect)
    doctorSelect.innerHTML = doctors.length
      ? doctors
          .map(
            (doctor, index) =>
              `<option value="${index}">${doctor.name} - ${doctor.specialty}</option>`,
          )
          .join("")
      : '<option value="">No doctors added</option>';
  const renderDashboard = () => {
    const appointments = getAppointments();
    const medicalRecords = getMedicalRecords();
    const activeDoctor =
      sessionDoctor ||
      (doctorSelect ? doctors[Number(doctorSelect.value)] : null);
    const doctorAppointments = appointments.filter(
      (appointment) =>
        !activeDoctor ||
        appointment.doctor === activeDoctor.name ||
        appointment.doctor === activeDoctor.role ||
        appointment.doctor === activeDoctor.specialty ||
        (activeDoctor.email === DOCTOR_EMAIL && appointment.doctor === "Doctor"),
    );
    const todayAppointments = doctorAppointments.filter(
      (appointment) => appointment.status !== "Cancelled",
    );
    const completed = todayAppointments.filter(
      (appointment) => appointment.status === "Completed",
    ).length;
    const cancelled = doctorAppointments.filter(
      (appointment) => appointment.status === "Cancelled",
    ).length;
    const doctorName = document.querySelector("#selected-doctor-name");
    if (doctorName)
      doctorName.textContent = activeDoctor ? activeDoctor.name : "Doctor";
    document.querySelector("#doctor-today-count").textContent =
      todayAppointments.length;
    document.querySelector("#doctor-completed-count").textContent = completed;
    document.querySelector("#doctor-cancelled-count").textContent = cancelled;
    document.querySelector("#doctor-schedule-count").textContent =
      `${todayAppointments.length} scheduled`;
    appointmentsBody.innerHTML = todayAppointments.length
      ? todayAppointments
          .map((appointment) => {
            const record = medicalRecords.find(
              (item) =>
                item.patient === appointment.patient &&
                item.date === appointment.date &&
                item.doctor === appointment.doctor,
            );
            const appointmentIndex = appointments.indexOf(appointment);
            return `<tr><td><strong>${appointment.patient}</strong><br><small>${appointment.email}</small></td><td>${appointment.age || "N/A"}</td><td>${appointment.bloodType || "N/A"}</td><td>${appointment.condition || "N/A"}</td><td>${appointment.service}</td><td>${appointment.date}<br>${appointment.time}</td><td>${appointment.contact}</td><td><input class="doctor-record-input" data-record-field="diagnosis" data-doctor-appointment-index="${appointmentIndex}" value="${record?.diagnosis || ""}" placeholder="Diagnosis"></td><td><input class="doctor-record-input" data-record-field="prescription" data-doctor-appointment-index="${appointmentIndex}" value="${record?.prescription || ""}" placeholder="Prescription"></td><td><div class="doctor-actions"><button class="doctor-status-button ${appointment.status === "Completed" ? "completed" : ""}" type="button" data-doctor-action="status" data-doctor-appointment-index="${appointmentIndex}" ${appointment.status === "Completed" ? "disabled" : ""}>${appointment.status === "Completed" ? "Done" : "Complete"}</button>${appointment.status === "Completed" ? "" : `<button class="doctor-cancel-button" type="button" data-doctor-action="cancel" data-doctor-appointment-index="${appointmentIndex}">Cancel</button>`}</div></td></tr>`;
          })
          .join("")
      : '<tr><td colspan="10" class="empty-state">No appointments yet.</td></tr>';
  };
  if (doctorSelect) doctorSelect.addEventListener("change", renderDashboard);

  appointmentsBody.addEventListener("change", (event) => {
    const input = event.target.closest(".doctor-record-input");
    if (!input) return;
    const appointments = getAppointments();
    const appointment = appointments[Number(input.dataset.doctorAppointmentIndex)];
    if (!appointment) return;
    saveAppointmentRecord(appointment, {
      [input.dataset.recordField]: input.value.trim(),
    });
  });

  appointmentsBody.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-doctor-action]");
    if (!actionButton) return;
    const appointments = getAppointments();
    const appointment =
      appointments[Number(actionButton.dataset.doctorAppointmentIndex)];
    if (!appointment) return;
    if (appointment.status === "Completed") return;
    const isCancelled = actionButton.dataset.doctorAction === "cancel";
    const row = actionButton.closest("tr");
    if (row && !isCancelled) {
      const diagnosis = row.querySelector('[data-record-field="diagnosis"]');
      const prescription = row.querySelector('[data-record-field="prescription"]');
      saveAppointmentRecord(appointment, {
        diagnosis: diagnosis ? diagnosis.value.trim() : "Pending consultation",
        prescription: prescription ? prescription.value.trim() : "To be determined after consultation",
      });
    }
    appointment.status = isCancelled ? "Cancelled" : "Completed";
    localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments));
    if (isCancelled) removeAppointmentRecord(appointment);
    renderDashboard();
    renderAdminAppointments();
  });
  renderDashboard();
}

function setupMedicalRecordsPage() {
  const recordForm = document.querySelector("#record-form");
  const recordsBody = document.querySelector("#records-body");
  if (!recordForm || !recordsBody) return;
  const formPanel = document.querySelector("#record-form-panel");
  const newRecordToggle = document.querySelector("#new-record-toggle");
  if (newRecordToggle && formPanel)
    newRecordToggle.addEventListener("click", () =>
      formPanel.classList.toggle("open"),
    );

  const syncAppointmentRecords = () => {
    const appointments = getAppointments();
    const storedRecords = getMedicalRecords();
    const seenAppointmentRecords = new Set();
    const records = storedRecords.filter((record) => {
      if (record.type !== "Appointment") return true;
      const appointment = appointments.find((item) =>
        isAppointmentRecordFor(record, item),
      );
      if (appointment?.status === "Cancelled") return false;
      const recordKey = `${record.patient}|${record.date}|${record.doctor || "Health personnel"}`;
      if (seenAppointmentRecords.has(recordKey)) return false;
      seenAppointmentRecords.add(recordKey);
      return true;
    });
    let changed = records.length !== storedRecords.length;
    appointments
      .filter((appointment) => appointment.status !== "Cancelled")
      .forEach((appointment) => {
        const recordKey = `${appointment.patient}|${appointment.date}|${appointment.doctor || "Health personnel"}`;
        const alreadyRecorded = seenAppointmentRecords.has(recordKey);
        if (alreadyRecorded) return;
        records.push({
          patient: appointment.patient,
          type: "Appointment",
          doctor: appointment.doctor || "Health personnel",
          date: appointment.date,
          diagnosis: "Pending consultation",
          prescription: "To be determined after consultation",
        });
        seenAppointmentRecords.add(recordKey);
        changed = true;
      });
    if (changed) localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  };

  const renderRecords = () => {
    const records = getMedicalRecords();
    const recordsCount = document.querySelector("#records-count");
    if (recordsCount)
      recordsCount.textContent = `${records.length} record${records.length === 1 ? "" : "s"} found`;
    if (!records.length) {
      recordsBody.innerHTML =
        '<div class="empty-state">No medical records yet.</div>';
      return;
    }
    recordsBody.innerHTML = records
      .map(
        (record) =>
          `<article class="record-card"><div class="record-card-head"><div class="record-icon">▤</div><div class="record-meta"><h2>${record.patient}<span class="record-type">${record.type}</span></h2><p>${record.doctor} · ${record.date}</p></div></div><div class="record-details"><div><strong>Diagnosis</strong><span>${record.diagnosis}</span></div><div><strong>Prescription</strong><span>${record.prescription}</span></div></div></article>`,
      )
      .join("");
  };

  recordForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(recordForm);
    const records = getMedicalRecords();
    records.push({
      patient: String(formData.get("patient")).trim(),
      type: String(formData.get("type")),
      doctor: String(formData.get("doctor")).trim(),
      date: String(formData.get("date")),
      diagnosis: String(formData.get("diagnosis")).trim(),
      prescription: String(formData.get("prescription")).trim(),
    });
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    recordForm.reset();
    if (formPanel) formPanel.classList.remove("open");
    const message = document.querySelector("#record-message");
    if (message) message.textContent = "Medical record saved successfully.";
    renderRecords();
  });
  syncAppointmentRecords();
  renderRecords();
}

function setupUserManagementPage() {
  const usersBody = document.querySelector("#users-body");
  const userForm = document.querySelector("#user-form");
  if (!usersBody || !userForm) return;
  const formPanel = document.querySelector("#user-form-panel");
  const addUserToggle = document.querySelector("#add-user-toggle");
  const searchInput = document.querySelector("#user-search");
  const roleFilter = document.querySelector("#role-filter");
  if (addUserToggle && formPanel)
    addUserToggle.addEventListener("click", () =>
      formPanel.classList.toggle("open"),
    );

  const collectUsers = () => {
    const account = getAccount();
    const users = [...getUsers()];
    if (account && !users.some((user) => user.email === account.email))
      users.unshift({
        name: `${account.firstName} ${account.lastName}`,
        email: account.email,
        role: "Patient",
        department: "Patient Services",
        joined: "Today",
        lastActive: "Now",
        status: "Active",
      });
    getDoctors().forEach((doctor) => {
      if (!users.some((user) => user.email === doctor.email))
        users.push({
          name: doctor.name,
          email: doctor.email,
          role: doctor.role || "Doctor",
          department: doctor.specialty,
          joined: "Today",
          lastActive: "Now",
          status: "Active",
        });
    });
    return users;
  };
  const renderUsers = () => {
    const users = collectUsers();
    const query = (searchInput?.value || "").toLowerCase();
    const role = roleFilter?.value || "All";
    const filtered = users.filter(
      (user) =>
        (role === "All" || user.role === role) &&
        `${user.name} ${user.email} ${user.department}`
          .toLowerCase()
          .includes(query),
    );
    document.querySelector("#total-users").textContent = users.length;
    document.querySelector("#active-users").textContent =
      `${users.filter((user) => user.status === "Active").length} active`;
    document.querySelector("#doctor-users").textContent = users.filter(
      (user) => user.role === "Doctor",
    ).length;
    document.querySelector("#patient-users").textContent = users.filter(
      (user) => user.role === "Patient",
    ).length;
    usersBody.innerHTML = filtered.length
      ? filtered
          .map(
            (user, index) =>
              `<tr><td><span class="user-avatar">${user.name
                .split(" ")
                .map((part) => part[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}</span><strong>${user.name}</strong><br><small>${user.email}</small></td><td><span class="user-role ${user.role.toLowerCase()}">${user.role}</span></td><td>${user.department || "-"}</td><td>${user.joined || "-"}</td><td>${user.lastActive || "-"}</td><td><span class="user-status">${user.status || "Active"}</span></td><td><button class="user-action" type="button" data-user-index="${index}">Suspend</button></td></tr>`,
          )
          .join("")
      : '<tr><td colspan="7" class="empty-state">No users found.</td></tr>';
  };
  userForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(userForm);
    const users = getUsers();
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const role = String(formData.get("role") || "");
    const department = String(formData.get("department") || "-").trim();
    const password = String(formData.get("password") || "");
    const message = document.querySelector("#user-message");

    if (!name || !email || !role || password.length < 8) {
      if (message) message.textContent = "Enter a name, email, role, and password with at least 8 characters.";
      return;
    }
    if (users.some((user) => String(user.email || "").trim().toLowerCase() === email)) {
      if (message) message.textContent = "That email is already registered.";
      return;
    }

    users.push({
      name, email, role, department, password,
      joined: new Date().toLocaleDateString(),
      lastActive: "Never",
      status: "Active",
    });
    if (["Doctor", "Nurse", "Midwife"].includes(role)) {
      const doctors = getDoctors();
      if (!doctors.some((doctor) => String(doctor.email || "").toLowerCase() === email)) {
        doctors.push({ name, role, specialty: department || role, email, contact: "-", password });
      }
      localStorage.setItem(DOCTORS_KEY, JSON.stringify(doctors));
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    userForm.reset();
    if (formPanel) formPanel.classList.remove("open");
    if (message) message.textContent = "User added successfully. They can now log in with their email and password.";
    renderUsers();
  });
  searchInput?.addEventListener("input", renderUsers);
  roleFilter?.addEventListener("change", renderUsers);
  renderUsers();
}

document.addEventListener("DOMContentLoaded", () => {
  setupAuthForms();
  setupLogout();
  setupProfileMenu();
  protectAdminPage();
  protectDoctorPage();
  protectBookingPage();
  setupBookingForm();
  setupStatusChanges();
  renderPatients();
  setupAppointmentPage();
  setupDoctorPage();
  setupDoctorDashboard();
  setupMedicalRecordsPage();
  setupUserManagementPage();
  renderAdminAppointments();
});
