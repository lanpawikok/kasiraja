<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Halaman depan mengarahkan tamu ke login, jadi respons yang benar
     * adalah redirect, bukan 200.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/');

        $response->assertRedirect(route('login', absolute: false));
    }
}
