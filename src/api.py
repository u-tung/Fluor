import numpy as np
from webview import Window
from typing import Any, TypedDict, Callable
from component import Component, COMPONENT_INFOS, register_compo, unregister_compo, compos
from threading import Lock


lock = Lock()
def api_wrap(func: Callable):
    def inner(*args):
        with lock:
            print(f"[webview] invoke: {func.__name__}{args[1:]}")
            func(*args)
    return inner

class Slot(TypedDict):
    compoId: int
    name: str

class Api:

    @api_wrap
    def createCompo(
        self, id: int, name: str, argNames: list[str], option: dict = {}
    ) -> None:
        compo = Component(
            id, name,
            args={n: None for n in argNames},
            calc=COMPONENT_INFOS[name].calc,
            no_calculating=option.get("no_calculating", False)
        )
        register_compo(compo)

    @api_wrap
    def deleteCompo(self, id: int) -> None:
        unregister_compo(id)

    @api_wrap
    def connectCompo(self, outCompoId: int, slot: Slot) -> None:
        compos[slot["compoId"]].args[slot["name"]] = compos[outCompoId]

        print(compos[slot["compoId"]].name)
        for name, arg in compos[slot["compoId"]].args.items():
            print("\t", name, arg, flush=True)

    @api_wrap
    def disconnectCompo(self, slot: Slot) -> None:
        compos[slot["compoId"]].args[slot["name"]] = None

        print(compos[slot["compoId"]].name)
        for name, arg in compos[slot["compoId"]].args.items():
            print("\t", name, arg, flush=True)

    @api_wrap
    def setCurrValue(self, compoId: int, rgb: tuple[int, int, int]) -> None:
        compos[compoId].curr_value = np.array(rgb, np.uint8)


def to_js_Map(dict_: dict) -> str:
    return "new Map([" + \
        ",".join(f"[{k},{v}]" for k, v in dict_.items()) + "])"

def send_curr_values(window: Window) -> None:
    values = {k: [*map(int, v.curr_value)]
        if isinstance(v.curr_value, np.ndarray)
        else [0,0,0]
        for k, v in compos.items()
    }
    window.evaluate_js(f"window.jsApi.setCurrValues({to_js_Map(values)})")
