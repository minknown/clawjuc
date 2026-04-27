package com.lunar.state;

public class LunarPhase {

    public enum Phase {
        NEW_MOON("dark", 0) {
            @Override
            public Phase transition() { return WAXING_CRESCENT; }
            @Override
            public double illumination() { return 0.0; }
        },
        WAXING_CRESCENT("growing", 1) {
            @Override
            public Phase transition() { return FIRST_QUARTER; }
            @Override
            public double illumination() { return 0.25; }
        },
        FIRST_QUARTER("half-light", 2) {
            @Override
            public Phase transition() { return WAXING_GIBBOUS; }
            @Override
            public double illumination() { return 0.50; }
        },
        WAXING_GIBBOUS("almost-full", 3) {
            @Override
            public Phase transition() { return FULL_MOON; }
            @Override
            public double illumination() { return 0.75; }
        },
        FULL_MOON("bright", 4) {
            @Override
            public Phase transition() { return WANING_GIBBOUS; }
            @Override
            public double illumination() { return 1.0; }
        },
        WANING_GIBBOUS("diminishing", 5) {
            @Override
            public Phase transition() { return LAST_QUARTER; }
            @Override
            public double illumination() { return 0.75; }
        },
        LAST_QUARTER("half-shadow", 6) {
            @Override
            public Phase transition() { return WANING_CRESCENT; }
            @Override
            public double illumination() { return 0.50; }
        },
        WANING_CRESCENT("fading", 7) {
            @Override
            public Phase transition() { return NEW_MOON; }
            @Override
            public double illumination() { return 0.25; }
        };

        private final String descriptor;
        private final int cyclePos;

        Phase(String descriptor, int cyclePos) {
            this.descriptor = descriptor;
            this.cyclePos = cyclePos;
        }

        public abstract Phase transition();
        public abstract double illumination();

        public String getDescriptor() { return descriptor; }
        public int getCyclePos() { return cyclePos; }
    }

    public static void main(String[] args) {
        Phase current = Phase.NEW_MOON;
        System.out.println("=== Lunar Phase Cycle ===");
        for (int i = 0; i <= 8; i++) {
            System.out.printf("%s [%s] illumination=%.0f%%%n",
                    current, current.getDescriptor(), current.illumination() * 100);
            current = current.transition();
        }
    }
}
