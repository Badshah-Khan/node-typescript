function authResolver(fn) {
  return (...args) => {
    const {
      req: { user },
    } = args[2];

    if (!user) throw error('common:error-general-unauthorized', 'UNAUTHORIZED');

    return fn(...args);
  };
}

export default authResolver;
