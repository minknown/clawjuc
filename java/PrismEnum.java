package com.prism.enumeration;

public class PrismEnum {

    public enum SpectrumColor {
        RED(620, 750, "warm", 0) {
            @Override
            public String blendWith(SpectrumColor other) {
                return "Warm blend: " + name() + "+" + other.name();
            }
            @Override
            public double energyFactor() { return 1.65; }
        },
        ORANGE(590, 620, "warm", 1) {
            @Override
            public String blendWith(SpectrumColor other) {
                return "Citrus fusion: " + name() + "+" + other.name();
            }
            @Override
            public double energyFactor() { return 2.05; }
        },
        YELLOW(570, 590, "neutral", 2) {
            @Override
            public String blendWith(SpectrumColor other) {
                return "Solar mix: " + name() + "+" + other.name();
            }
            @Override
            public double energyFactor() { return 2.14; }
        },
        GREEN(495, 570, "cool", 3) {
            @Override
            public String blendWith(SpectrumColor other) {
                return "Nature merge: " + name() + "+" + other.name();
            }
            @Override
            public double energyFactor() { return 2.34; }
        },
        BLUE(450, 495, "cool", 4) {
            @Override
            public String blendWith(SpectrumColor other) {
                return "Deep merge: " + name() + "+" + other.name();
            }
            @Override
            public double energyFactor() { return 2.72; }
        },
        VIOLET(380, 450, "mystic", 5) {
            @Override
            public String blendWith(SpectrumColor other) {
                return "Mystic fusion: " + name() + "+" + other.name();
            }
            @Override
            public double energyFactor() { return 3.10; }
        };

        private final int minWavelength;
        private final int maxWavelength;
        private final String temperature;
        private final int position;

        SpectrumColor(int minWavelength, int maxWavelength, String temperature, int position) {
            this.minWavelength = minWavelength;
            this.maxWavelength = maxWavelength;
            this.temperature = temperature;
            this.position = position;
        }

        public abstract String blendWith(SpectrumColor other);
        public abstract double energyFactor();

        public int wavelengthRange() { return maxWavelength - minWavelength; }
        public String getTemperature() { return temperature; }
        public int getPosition() { return position; }

        public boolean isAdjacent(SpectrumColor other) {
            return Math.abs(this.position - other.position) == 1;
        }
    }

    public static void main(String[] args) {
        System.out.println("=== PrismEnum Spectrum Demo ===");
        for (SpectrumColor color : SpectrumColor.values()) {
            System.out.printf("%-8s nm=%3d-%3d temp=%-7s eV=%.2f range=%d%n",
                    color, color.minWavelength, color.maxWavelength,
                    color.getTemperature(), color.energyFactor(), color.wavelengthRange());
        }
        System.out.println();
        System.out.println(RED.blendWith(BLUE));
        System.out.println(GREEN.blendWith(YELLOW));
        System.out.println("RED adjacent ORANGE? " + RED.isAdjacent(ORANGE));
        System.out.println("RED adjacent VIOLET? " + RED.isAdjacent(VIOLET));
    }
}
