<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_health_check_retorna_200(): void
    {
        $response = $this->get('/up');
        $response->assertStatus(200);
    }
}
