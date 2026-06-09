import { env } from "@free-on-the-porch/env/server";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix("api/v1");
	app.enableCors({
		origin: env.CORS_ORIGIN,
		credentials: true,
	});

	// Swagger
	const config = new DocumentBuilder()
		.setTitle("Free on the Porch API")
		.setDescription("API for the Free on the Porch mobile app")
		.setVersion("1.0")
		.addBearerAuth()
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("docs", app, document);

	await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
