// Admin Side Notifications Logic
const adminStartTime = Date.now();

function initAdminNotifications() {
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

function sendAdminAlert(title, msg, targetPage) {
    if (Notification.permission === "granted") {
        const n = new Notification(`[ADMIN CONTROL] ${title}`, {
            body: msg,
            icon: 'https://cdn-icons-png.flaticon.com/512/6024/6024190.png', 
            requireInteraction: true
        });
        n.onclick = function() {
            window.focus();
            window.location.href = targetPage;
            n.close();
        };
    }
}

// 1. New Leave Request Received
db.collection("emp_leaves").where("status", "==", "Pending").onSnapshot(snap => {
    snap.docChanges().forEach(change => {
        if (change.type === "added") {
            const data = change.doc.data();
            if (data.timestamp > adminStartTime) {
                sendAdminAlert("New Leave Request", `${data.name} has applied for leave.`, "leave_admin.html");
            }
        }
    });
});

// 2. Late Arrival Requests
db.collection("late_requests").where("status", "==", "Pending").onSnapshot(snap => {
    snap.docChanges().forEach(change => {
        if (change.type === "added") {
            const data = change.doc.data();
            if (data.timestamp > adminStartTime) {
                sendAdminAlert("Late Arrival Request", `${data.empName} is requesting a late entry.`, "branch_dashboard.html");
            }
        }
    });
});

// 3. New Thought Post Alert
db.collection("global_thoughts").onSnapshot(snap => {
    snap.docChanges().forEach(change => {
        if (change.type === "added") {
            const data = change.doc.data();
            if (data.timestamp > adminStartTime) {
                sendAdminAlert("New Thought Shared", `${data.author} posted a new thought.`, "home_page.html");
            }
        }
    });
});

// 4. Employee Birthday (For Admin Official Wish)
db.collection("employees").onSnapshot(snap => {
    const today = new Date();
    const mmdd = `${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    snap.docChanges().forEach(change => {
        const emp = change.doc.data();
        if (emp.dob && emp.dob.includes(mmdd)) {
            sendAdminAlert("Staff Birthday 🎁", `${emp.name} has a birthday today.`, "staff-control.html");
        }
    });
});