class LCM():
    def __init__(self, num1, num2):
        self.num1 = num1
        self.num2 = num2

    def compute_lcm(self):
        if self.num1 > self.num2:
            greater = self.num1
        else:
            greater = self.num2

        while(True):
            if((greater % self.num1 == 0) and (greater % self.num2 == 0)):
                lcm = greater
                break
            greater += 1

        return lcm

lcm = LCM(54, 24)
assert(lcm.compute_lcm() == 216)