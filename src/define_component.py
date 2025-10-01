import numpy as np
import threading
import component
from time import sleep
from component import define_component, RGB, new_rgb, UnCalculated

webview_exited = threading.Event()
Signal = RGB | None


@define_component("Add", "sum")
def _(rgb1: Signal, rgb2: Signal):
    if rgb1 is None or rgb2 is None:
        return None
    return rgb1 + rgb2


@define_component("SafeAdd", "sum")
def _(rgb1: Signal, rgb2: Signal):
    if rgb1 is None or rgb2 is None:
        return None
    result = rgb1.astype(np.int16) + rgb2.astype(np.int16)
    return np.clip(result, 0, 255).astype(np.uint8)


@define_component("Sub", "diff")
def _(rgb1: Signal, rgb2: Signal):
    if rgb1 is None or rgb2 is None:
        return None
    return rgb1 - rgb2


@define_component("SafeSub", "sum")
def _(rgb1: Signal, rgb2: Signal):
    if rgb1 is None or rgb2 is None:
        return None
    result = rgb1.astype(np.int16) - rgb2.astype(np.int16)
    return np.clip(result, 0, 255).astype(np.uint8)


@define_component("Multiply", "product")
def _(rgb1: Signal, rgb2: Signal):
    if rgb1 is None or rgb2 is None:
        return None
    return rgb1 * rgb2


@define_component("SafeMultiply", "product")
def _(rgb1: Signal, rgb2: Signal):
    if rgb1 is None or rgb2 is None:
        return None
    result = rgb1.astype(np.int16) * rgb2.astype(np.int16)
    return np.clip(result, 0, 255).astype(np.uint8)


@define_component("Mix", "mixed")
def _(rgb1: Signal, rgb2: Signal):
    if rgb1 is None or rgb2 is None:
        return None
    return (rgb1//2 + rgb2//2).astype(np.uint8)


@define_component("Invert", "out")
def _(rgb: Signal):
    if rgb is None:
        return None
    return new_rgb(255,255,255)-rgb


sin_rgb = np.array([0,0,0], np.uint8)
def sine_source():
    x = 0.0
    while not webview_exited.is_set():
        x += 0.1
        x %= np.pi*2
        sin_rgb[:] = (np.sin(x)+1)*127.5
        sleep(0.01)
threading.Thread(target=sine_source).start()

@define_component("SinWave", "out")
def _():
    return sin_rgb


cos_rgb = np.array([0,0,0], np.uint8)
def cosine_source():
    x = 0.0
    while not webview_exited.is_set():
        x += 0.1
        x %= np.pi*2
        cos_rgb[:] = (np.cos(x)+1)*127.5
        sleep(0.01)
threading.Thread(target=cosine_source).start()

@define_component("CosWave", "out")
def _():
    return cos_rgb


@define_component("OnlyRed", "out")
def _(rgb: Signal):
    if rgb is None:
        return None
    return new_rgb(rgb[0], rgb[0], rgb[0])


@define_component("OnlyGreen", "out")
def _(rgb: Signal):
    if rgb is None:
        return None
    return new_rgb(rgb[1], rgb[1], rgb[1])


@define_component("OnlyBlue", "out")
def _(rgb: Signal):
    if rgb is None:
        return None
    return new_rgb(rgb[2], rgb[2], rgb[2])


@define_component("Compose", "rgb")
def _(r: Signal, g: Signal, b: Signal):
    if r is None or g is None or b is None:
        return None
    return new_rgb(r[0], g[1], b[2])


@define_component("True", "out")
def _():
    return new_rgb(1,1,1)


@define_component("False", "out")
def _():
    return new_rgb(0,0,0)


@define_component("White", "out")
def _():
    return new_rgb(255,255,255)


rand_rgb = np.array([0,0,0], np.uint8)
def random_source():
    while not webview_exited.is_set():
        rand_rgb[:] = np.random.rand(3)*255
        sleep(0.5)
threading.Thread(target=random_source).start()

@define_component("Random", "out")
def _():
    return rand_rgb


clock_rgb = np.array([0,0,0], np.uint8)
def clock_source():
    while not webview_exited.is_set():
        sleep(0.125)
        clock_rgb[2] = not clock_rgb[2]
        sleep(0.125)
        clock_rgb[2] = not clock_rgb[2]
        clock_rgb[1] = not clock_rgb[2]
        sleep(0.125)
        clock_rgb[2] = not clock_rgb[2]
        sleep(0.125)
        clock_rgb[0] = not clock_rgb[0]
        clock_rgb[1] = not clock_rgb[1]
        clock_rgb[2] = not clock_rgb[2]
threading.Thread(target=clock_source).start()

@define_component("Clock", "out")
def _():
    return clock_rgb*np.uint(255)


variable_clock_variable = np.array([1,1,0], np.uint8)
variable_clock_rgb = np.array([0,0,0], np.uint8)
def variable_clock():
    while not webview_exited.is_set():
        variable_clock_rgb[:] = 255
        sleep(variable_clock_variable[0]/variable_clock_variable[1]/2)
        variable_clock_rgb[:] = 0
        sleep(variable_clock_variable[0]/variable_clock_variable[1]/2)
threading.Thread(target=variable_clock).start()

@define_component("VariableClock", "out")
def _(recip: Signal):
    if recip is None or not all(recip[:2]):
        return None
    variable_clock_variable[:] = recip
    return variable_clock_rgb


half_clock_rgb = np.array([0,0,0], np.uint8)
def half_clock_source():
    while not webview_exited.is_set():
        sleep(0.0625)
        half_clock_rgb[2] = not half_clock_rgb[2]
        sleep(0.0625)
        half_clock_rgb[2] = not half_clock_rgb[2]
        half_clock_rgb[1] = not half_clock_rgb[2]
        sleep(0.0625)
        half_clock_rgb[2] = not half_clock_rgb[2]
        sleep(0.0625)
        half_clock_rgb[0] = not half_clock_rgb[0]
        half_clock_rgb[1] = not half_clock_rgb[1]
        half_clock_rgb[2] = not half_clock_rgb[2]
threading.Thread(target=half_clock_source).start()

@define_component("HalfClock", "out")
def _():
    return half_clock_rgb*np.uint(255)


trigger_random_register = {}
@define_component("TriggerRandom", "out")
def _(on: Signal):
    if on is None:
        return None
    register = trigger_random_register.setdefault(
        component.CURR_COMPO.id, {"prev_on": False}
    )
    prev_on = register["prev_on"]
    register["prev_on"] = any(on)

    if (not prev_on) and any(on):
        return (np.random.rand(3)*255).astype(np.uint8)

    prev_value = component.CURR_COMPO.prev_value
    if isinstance(prev_value, UnCalculated):
        return None
    return prev_value


@define_component("Switch", "out")
def _(se: Signal, on: Signal, off: Signal):
    if se is None:
        return None
    if any(se):
        return on
    return off


@define_component("Slider", "out")
def _():
    ...


@define_component("LED01", "")
def _(output: Signal):
    return output


@define_component("LED02", "")
def _(output: Signal):
    return output


@define_component("LED03", "")
def _(output: Signal):
    return output
