import numpy as np
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any, Literal

RGB = np.ndarray[
    tuple[Literal[3]],
    np.dtype[np.uint8]
]

def new_rgb(r: int, g: int, b: int) -> RGB:
    return np.array([r, g, b], np.uint8)

class UnCalculated:
    def __repr__(self, ):
        return f"<{self.__class__.__name__}>"
unCalculated = UnCalculated()


class Component:
    id: int
    name: str
    args: dict[str, "Component | None"]
    prev_value: RGB | None | UnCalculated
    curr_value: RGB | None | UnCalculated
    _calc: Callable[..., RGB | None]
    no_calculating: bool

    def __init__(
        self,
        id: int,
        name: str,
        args: dict[str, "Component | None"],
        calc: Callable[..., RGB | None],
        *,
        no_calculating: bool = False
    ):
        self.id = id
        self.name = name
        self.args = args

        self._calc = calc
        self.no_calculating = no_calculating
        self.curr_value = unCalculated
        self.prev_value = unCalculated
        if no_calculating:
            self.curr_value = new_rgb(0,0,0)

    def __repr__(self, ):
        connected = {
            k: None if v is None else v.id
            for k, v in self.args.items()
        }
        return \
            f"<{self.__class__.__name__} id={self.id} " \
            f"name={self.name} curr_value={self.curr_value} " \
            f"connected={connected}>" \


compos: dict[int, Component] = {}

def register_compo(compo: Component) -> None:
    compos[compo.id] = compo

def unregister_compo(id: int) -> None:
    del compos[id]


CURR_COMPO: Component
def calculate_compo(compo: Component) -> RGB | None:
    global CURR_COMPO
    if not isinstance(compo.curr_value, UnCalculated):
        return compo.curr_value

    kwarg_values = {}
    for keyword, other_compo in compo.args.items():
        kwarg_values[keyword] = None
        if other_compo is not None:
            kwarg_values[keyword] = calculate_compo(other_compo)

    CURR_COMPO = compo
    try: result = compo._calc(**kwarg_values)
    except Exception as exc:
        print(f"[component calc {compo._calc.__name__}] Error:", exc)
        return None

    compo.curr_value = result
    return result


def clean_all_curr_value():
    for compo in compos.values():
        if compo.no_calculating is True:
            continue
        compo.prev_value = compo.curr_value
        compo.curr_value = unCalculated


@dataclass
class ComponentInfo:
    calc: Callable[..., RGB | None]
    name: str
    outLabel: str
    argLabels: list[str]

COMPONENT_INFOS: dict[str, ComponentInfo] = {}
def define_component(name: str, outLabel: str):
    def inner(calc: Callable[..., RGB | None]):
        COMPONENT_INFOS[name] = ComponentInfo(
            calc=calc,
            name=name,
            outLabel=outLabel,
            argLabels=[*calc.__annotations__.keys()]
        )
        return calc
    return inner
