import unittest
import numpy as np
from component import Component, new_rgb, calculate_compo, RGB, COMPONENT_INFOS, define_component
from dataclasses import asdict


class Test(unittest.TestCase):

    def test_calculate_compo(self, ):
        sineCompo = Component(0, "True", args={}, calc=lambda: new_rgb(1,1,1))
        randomCompo = Component(1, "False", args={}, calc=lambda: new_rgb(0,0,0))

        def add_func(rgb1: RGB, rgb2: RGB):
            return rgb1 + rgb2
        addCompo = Component(
            2, "Add",
            args={"rgb1": sineCompo, "rgb2": randomCompo},
            calc=add_func
        )

        def out_func(rgb: RGB):
            return rgb
        outCompo = Component(3, "Out", args={"rgb": addCompo}, calc=out_func)

        result = calculate_compo(outCompo)
        self.assertTrue(all(result == new_rgb(1,1,1)))

        assert isinstance(sineCompo.curr_value, np.ndarray)
        self.assertTrue(all(sineCompo.curr_value == new_rgb(1,1,1)))

        assert isinstance(randomCompo.curr_value, np.ndarray)
        self.assertTrue(all(randomCompo.curr_value == new_rgb(0,0,0)))

        assert isinstance(addCompo.curr_value, np.ndarray)
        self.assertTrue(all(addCompo.curr_value == new_rgb(1,1,1)))

    def test_define_component(self, ):
        @define_component("My_add", "sum")
        def calc(rgb1: RGB, rgb2: RGB):
            return rgb1 + rgb2

        self.assertDictEqual(asdict(COMPONENT_INFOS["My_add"]), {
            "name": "My_add",
            "outLabel": "sum",
            "argLabels": ["rgb1", "rgb2"],
            "calc": calc
        })


if __name__ == "__main__":
    unittest.main()
