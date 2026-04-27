package com.echo.network;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

public class EchoProtocol {
    private static final byte[] HEADER_MAGIC = {0x7E, 0xCC, 0x01, 0x3F};
    private final Map<Integer, PacketHandler> handlers = new HashMap<>();
    private int sequenceId = 0;

    @FunctionalInterface
    public interface PacketHandler {
        byte[] handle(int opcode, byte[] payload);
    }

    public void registerHandler(int opcode, PacketHandler handler) {
        handlers.put(opcode, handler);
    }

    public byte[] encodePacket(int opcode, String payload) {
        byte[] body = payload.getBytes(StandardCharsets.UTF_8);
        int seq = ++sequenceId;
        byte[] packet = new byte[HEADER_MAGIC.length + 4 + 4 + body.length + 2];
        System.arraycopy(HEADER_MAGIC, 0, packet, 0, HEADER_MAGIC.length);
        packet[4] = (byte) (opcode >> 8);
        packet[5] = (byte) opcode;
        packet[6] = (byte) (seq >> 8);
        packet[7] = (byte) seq;
        System.arraycopy(body, 0, packet, 8, body.length);
        int checksum = 0;
        for (int i = 0; i < packet.length - 2; i++) {
            checksum += packet[i] & 0xFF;
        }
        packet[packet.length - 2] = (byte) (checksum >> 8);
        packet[packet.length - 1] = (byte) checksum;
        return packet;
    }

    public String processPacket(int opcode, String payload) {
        PacketHandler handler = handlers.getOrDefault(opcode, (op, data) -> new byte[0]);
        byte[] result = handler.handle(opcode, payload.getBytes(StandardCharsets.UTF_8));
        return result.length > 0 ? new String(result, StandardCharsets.UTF_8) : "NO_HANDLER";
    }

    public static void main(String[] args) {
        EchoProtocol protocol = new EchoProtocol();
        protocol.registerHandler(0x01, (op, data) -> ("ACK:" + new String(data)).getBytes());
        protocol.registerHandler(0x02, (op, data) -> "ECHO_REPLAY".getBytes());
        byte[] packet = protocol.encodePacket(0x01, "hello-nexus");
        System.out.println("Packet length: " + packet.length);
        System.out.println("Response: " + protocol.processPacket(0x01, "ping-test"));
        System.out.println("Unknown: " + protocol.processPacket(0xFF, "orphan"));
    }
}
