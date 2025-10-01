from threading import Thread, Lock
from queue import Queue
from socket import socket, SOCK_STREAM, AF_INET
from typing import Any
from collections.abc import Callable
import threading
import time


class Client:
    """
    The class designed based on thread safety is responsible
    for managing the fluorescent stick client and sending RGB signals.
    """
    _clients: list["Client"] = []

    _conn: socket
    _handler: Thread
    _queue: Queue[bytes | None]
    _closing_event: threading.Event

    @classmethod
    def register(cls, conn: socket) -> None:
        with Lock():
            cls._clients.append(cls(conn))

    @classmethod
    def send_rgb_all(cls, r: int, g: int, b: int) -> None:
        for client in cls._clients:
            client.send_rgb(r, g, b)

    @classmethod
    def get_clients(cls, ) -> tuple["Client", ...]:
        return tuple(cls._clients)

    def __init__(self, conn: socket):
        self._conn = conn
        self._connecting = True
        self._queue = Queue()

        self._closing_event = threading.Event()
        self._handler = Thread(
            target=self._handle,
            name=f"Handler of {self}"
        )
        self._handler.start()

    def _handle(self, ) -> None:
        try:
            while not self._closing_event.is_set():
                msg = self._queue.get()
                if msg is None:
                    break

                try: self._conn.sendall(msg)
                except OSError as err:
                    print(f"[IN {self}._handler]: {err}")
                    self.close()
                    break

        except Exception as err:
            print(f"[IN {self}._handler]: {err}")
            raise err

    def close(self, ):
        with Lock():
            self._closing_event.set()
            self._conn.close()
            self._connecting = False
            self._clients.remove(self)
            self._queue.put(None)

    @property
    def connecting(self, ) -> bool:
        return self._connecting

    def send_rgb(self, r: int, g: int, b: int) -> None:
        self._queue.put(
            f"{r:03},{g:03},{b:03},{r:03},{g:03},{b:03}\n".encode()
        )


if __name__ == "__main__":
    ...
    # def control_handle():
    #     rgbs01: list[RGB] = []
    #     def setter(rgb1, rgb2, rgb3) -> None:
    #         rgbs01[:] = [rgb1, rgb2, rgb3]
    #     Thread(target=rgb_gen01, args=(setter, )).start()

    #     while True:
    #         for client, rgb in zip(Client.get_clients(), rgbs01):
    #             client.send_rgb(*rgb)
    #         time.sleep(0.5)

    # Thread(target=control_handle).start()