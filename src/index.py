import os
import threading
from pprint import pprint
from socket import AF_INET, SOCK_STREAM, socket
from threading import Thread
from time import sleep

import numpy as np
import webview

from api import Api, send_curr_values
from component import calculate_compo, clean_all_curr_value, compos
from define_component import webview_exited
from server import Client


def get_entrypoint():
    def exists(path):
        return os.path.exists(os.path.join(os.path.dirname(__file__), path))

    if exists('../gui/index.html'): # unfrozen development
        return '../gui/index.html'

    if exists('../Resources/gui/index.html'): # frozen py2app
        return '../Resources/gui/index.html'

    if exists('./gui/index.html'):
        return './gui/index.html'

    raise Exception('No index.html found')


def set_interval(interval):
    def decorator(function):
        def wrapper(*args, **kwargs):
            stopped = threading.Event()

            def loop(): # executed in another thread
                while not stopped.wait(interval): # until stopped
                    function(*args, **kwargs)

            t = threading.Thread(target=loop)
            t.daemon = True # stop if the program exits
            t.start()
            return stopped
        return wrapper
    return decorator


def daemon():
    while not webview_exited.is_set():
        try:
            clients = Client.get_clients()
            clean_all_curr_value()

            for compo in compos.values():
                if compo.name in ["LED01", "LED02", "LED03"]:
                    calculate_compo(compo)

                    idx = ["LED01", "LED02", "LED03"].index(compo.name)
                    if isinstance(compo.curr_value, np.ndarray) \
                        and len(clients) > idx:
                        clients[idx].send_rgb(*compo.curr_value)

            if compos:
                send_curr_values(window)

        except Exception as exc:
            print(f"[IN daemon] Error:", exc)
            print(f"[IN daemon] Try reboot")

        sleep(0.05)


def handle_conn(conn: socket) -> None:
    print(f"connect client {conn.getsockname()}")
    Client.register(conn)

def server_main():
    try:
        serverSock = socket(AF_INET, SOCK_STREAM)
        serverSock.bind(("0.0.0.0", 8888))
        serverSock.listen(5)

        while not webview_exited.is_set():
            conn, addr = serverSock.accept()
            handle_conn(conn)

    finally:
        serverSock.close()


if __name__ == '__main__':
    try:
        import define_component  # Load defined components
        entry = get_entrypoint()
        window = webview.create_window("LED 控制器", entry, js_api=Api())

        Thread(target=daemon).start()
        Thread(target=server_main).start()
        webview.start(debug=True)

    finally:
        webview_exited.set()
