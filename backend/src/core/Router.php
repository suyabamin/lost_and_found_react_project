<?php
declare(strict_types=1);

class Router
{
    private array $routes = [];

    public function get(string $path, array|callable $handler): void { $this->add('GET', $path, $handler); }
    public function post(string $path, array|callable $handler): void { $this->add('POST', $path, $handler); }
    public function patch(string $path, array|callable $handler): void { $this->add('PATCH', $path, $handler); }
    public function delete(string $path, array|callable $handler): void { $this->add('DELETE', $path, $handler); }

    private function add(string $method, string $path, array|callable $handler): void
    {
        $pattern = preg_replace('/\{([a-zA-Z_]+)\}/', '(?P<$1>[^/]+)', $path);
        $this->routes[] = ['method' => $method, 'pattern' => '#^' . $pattern . '$#', 'handler' => $handler];
    }

    public function dispatch(string $method, string $path): void
    {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $method || !preg_match($route['pattern'], $path, $matches)) {
                continue;
            }
            $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
            $handler = $route['handler'];
            if (is_callable($handler)) {
                $handler($params);
            } else {
                [$class, $action] = $handler;
                (new $class())->$action($params);
            }
            return;
        }
        Response::error('Route not found.', 404);
    }
}
