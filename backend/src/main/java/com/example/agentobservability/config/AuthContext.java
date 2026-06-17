package com.example.agentobservability.config;

public final class AuthContext {
    private static final ThreadLocal<Integer> CURRENT_USER = new ThreadLocal<>();
    private AuthContext() {}
    public static void setUserId(Integer userId) { CURRENT_USER.set(userId); }
    public static Integer userId() {
        Integer id = CURRENT_USER.get();
        return id == null ? 1 : id;
    }
    public static void clear() { CURRENT_USER.remove(); }
}
