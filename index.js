const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

const server = require("http").createServer(app);
const io = require("socket.io")(server);

io.on("connect", (socket) => {
    var users = {};
    console.log("co", socket.id, "ket noi");
    const clientRoom = getClientRoom(); // Lấy room thỏa mãn điều kiện.
    socket.join(clientRoom);
    if (io.sockets.adapter.rooms.get(clientRoom).size < 2) {
        //kiểm tra xem phòng có dưới 2 ng trong phòng không
        users["user1"] = socket.id;
        io.in(clientRoom).emit("statusRoom", {
            message: "Đang chờ người lạ ...",
            status: 0
        }); // emit cho tất cả client trong phòng
    } else {
        users["user2"] = socket.id;
        io.in(clientRoom).emit("statusRoom", {
            message: "Người lạ đã vào phòng",
            status: 1
        }); // emit cho tất cả client trong phòng
    }

    /* … */
    socket.on("event", (event) => {
        let { type, id, data } = event;
        if (type === "end-game") {
            io.to(clientRoom).emit("response_controller", {
                type: "end-game",
                data
            });
        }
        if (id === users["user1"]) {
            switch (type) {
                case "move-up":
                    io.to(clientRoom).emit("response_controller", {
                        type: "up"
                    });
                    break;
                case "move-down":
                    io.to(clientRoom).emit("response_controller", {
                        type: "down"
                    });
                    break;
                case "move-left":
                    io.to(clientRoom).emit("response_controller", {
                        type: "left"
                    });
                    break;
                case "move-right":
                    io.to(clientRoom).emit("response_controller", {
                        type: "right"
                    });
                    break;
                case "end":
                    io.to(clientRoom).emit("response_controller", {
                        type: "end"
                    });
                    break;
                case "bullet-shoot":
                    io.to(clientRoom).emit("response_controller", {
                        type: "bullet-shoot"
                    });
                    break;
                case "bullet-shoot1":
                    io.to(clientRoom).emit("response_controller", {
                        type: "bullet-shoot1"
                    });
                    break;
                default:
                    break;
            }
        }
        if (id === users["user2"]) {
            switch (type) {
                case "move-up":
                    io.to(clientRoom).emit("response_controller", {
                        type: "move-up"
                    });
                    break;
                case "move-down":
                    io.to(clientRoom).emit("response_controller", {
                        type: "move-down"
                    });
                    break;
                case "move-left":
                    io.to(clientRoom).emit("response_controller", {
                        type: "move-left"
                    });
                    break;
                case "move-right":
                    io.to(clientRoom).emit("response_controller", {
                        type: "move-right"
                    });
                    break;
                case "end":
                    io.to(clientRoom).emit("response_controller", {
                        type: "move-end"
                    });
                    break;
                case "bullet-shoot":
                    io.to(clientRoom).emit("response_controller", {
                        type: "bullet-shoot-enemy"
                    });
                    break;
                case "bullet-shoot1":
                    io.to(clientRoom).emit("response_controller", {
                        type: "bullet-shoot-enemy1"
                    });
                    break;
                default:
                    break;
            }
        }
    });

    socket.on("disconnect", (reason) => {
        // Khi client thoát thì emit cho người cùng phòng biết
        socket.to(clientRoom).emit("statusRoom", {
            message: "Người lạ đã thoát. Đang chờ người tiếp theo ....",
            status: 2
        });
    });
});

const getClientRoom = () => {
    let index = 0;
    while (true) {
        if (
            !io.sockets.adapter.rooms.get(index) ||
            io.sockets.adapter.rooms.get(index).size < 2
        ) {
            return index;
        }
        index++;
    }
};

server.listen(process.env.PORT || port, () => {
    console.log(`Example app listening at http://localhost:${process.env.PORT || port}`);
});
