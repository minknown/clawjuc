package com.shadow.proxy;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.util.HashMap;
import java.util.Map;

public class ShadowProxy {

    public interface DataService {
        String fetch(String query);
        void store(String key, String value);
        int count();
    }

    public static class RealDataService implements DataService {
        private final Map<String, String> storage = new HashMap<>();

        @Override
        public String fetch(String query) {
            return storage.getOrDefault(query, "NOT_FOUND");
        }

        @Override
        public void store(String key, String value) {
            storage.put(key, value);
        }

        @Override
        public int count() {
            return storage.size();
        }
    }

    public static class TimingInvocationHandler implements InvocationHandler {
        private final Object target;

        public TimingInvocationHandler(Object target) {
            this.target = target;
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
            long start = System.nanoTime();
            Object result = method.invoke(target, args);
            long elapsed = System.nanoTime() - start;
            System.out.printf("  [TIMING] %s took %d ns%n", method.getName(), elapsed);
            return result;
        }
    }

    @SuppressWarnings("unchecked")
    public static <T> T createProxy(T target, Class<?>... interfaces) {
        return (T) Proxy.newProxyInstance(
                target.getClass().getClassLoader(),
                interfaces,
                new TimingInvocationHandler(target)
        );
    }

    public static void main(String[] args) {
        DataService real = new RealDataService();
        DataService proxied = createProxy(real, DataService.class);

        System.out.println("--- Shadow Proxy Demo ---");
        proxied.store("user:1", "alice");
        proxied.store("user:2", "bob");
        proxied.store("config", "prod");
        System.out.println("Fetch user:1 => " + proxied.fetch("user:1"));
        System.out.println("Fetch missing => " + proxied.fetch("no:such:key"));
        System.out.println("Count => " + proxied.count());
    }
}
