document.addEventListener('DOMContentLoaded', function () {
    let currentItemId;

    // Fetch items from the server and display them on the board
    async function fetchItems() {
        try {
            const response = await fetch('api.php');
            
            if (!response.ok) {
                throw new Error("Failed to fetch items from server.");
            }

            const items = await response.json();
            
            clearBoard();
            items.forEach(addItemToBoard);
        } catch (error) {
            console.error("Error fetching items:", error);
        }
    }

    function addItemToBoard(item) {
        const column = document.getElementById(item.status);
        if (!column) {
            console.error(`Column with status '${item.status}' not found for item`, item);
            return;
        }
        const itemElement = createItemElement(item);
        column.querySelector('.items').appendChild(itemElement);
    }

    function clearBoard() {
        document.querySelectorAll('.items').forEach(column => column.innerHTML = '');
    }

    document.getElementById("addItemForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const title = document.getElementById("title").value;
        const description = document.getElementById("description").value;
        const status = document.getElementById("status").value;

        const response = await fetch('api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, status })
        });

        if (response.ok) {
            document.getElementById("addItemForm").reset();
            fetchItems();
        } else {
            alert("Error adding task");
        }
    });

    function createItemElement(item) {
        const itemElement = document.createElement("div");
        itemElement.classList.add("item");
        itemElement.textContent = item.title;
        itemElement.setAttribute("draggable", "true");
        itemElement.dataset.id = item.id;
        itemElement.dataset.status = item.status;

        itemElement.addEventListener("click", function() {
            openModal(item);
        });

        itemElement.addEventListener("dragstart", handleDragStart);
        itemElement.addEventListener("dragend", handleDragEnd);

        return itemElement;
    }

    function handleDragStart(event) {
        event.dataTransfer.setData("text", event.target.dataset.id);
        event.dataTransfer.effectAllowed = "move";
        event.target.classList.add("dragging");
    }

    function handleDragEnd(event) {
        event.target.classList.remove("dragging");
    }

    document.querySelectorAll(".column").forEach(column => {
        column.addEventListener("dragover", handleDragOver);
        column.addEventListener("drop", handleDrop);
    });

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }

    async function handleDrop(event) {
        event.preventDefault();
        const itemId = event.dataTransfer.getData("text");
        const newStatus = event.currentTarget.dataset.status;

        const itemElement = document.querySelector(`.item[data-id="${itemId}"]`);
        const title = itemElement ? itemElement.textContent : "";
        const description = itemElement.description;
        //const description = ""; // Fetch or add description if available

        // Update item in the backend
        await updateItemStatus(itemId, title, description, newStatus);

        fetchItems();  // Refresh items to reflect changes
    }

    async function updateItemStatus(itemId, title, description, newStatus) {
        const response = await fetch("api.php", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: itemId, title, description, status: newStatus })
        });

        if (!response.ok) {
            console.error("Error updating item status");
        }
    }

    function openModal(item) {
        currentItemId = item.id;
        document.getElementById("editTitle").value = item.title;
        document.getElementById("editDescription").value = item.description;
        document.getElementById("editStatus").value = item.status;
        document.getElementById("modal").style.display = "block";
    }

    function closeModal() {
        document.getElementById("modal").style.display = "none";
    }

    document.getElementById("editItemForm").addEventListener("submit", async function(event) {
        event.preventDefault();

        const title = document.getElementById("editTitle").value;
        const description = document.getElementById("editDescription").value;
        const status = document.getElementById("editStatus").value;

        const response = await fetch('api.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentItemId, title, description, status })
        });

        if (response.ok) {
            closeModal();
            fetchItems();
        } else {
            alert("Error updating task");
        }
    });

    fetchItems();  // Initial fetch to display items when page loads
});
