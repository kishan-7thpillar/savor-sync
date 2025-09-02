import { POSIntegration } from "./base";
import { SquareIntegration } from "./square";

export type POSSystem = "square" | "toast" | "generic";

export class POSIntegrationFactory {
  static create(
    posSystem: POSSystem,
    locationId: string,
    credentials: Record<string, any>
  ): POSIntegration {
    switch (posSystem) {
      case "square":
        return new SquareIntegration(locationId, credentials);
      case "toast":
        // TODO: Implement Toast integration
        throw new Error("Toast integration not yet implemented");
      case "generic":
        // TODO: Implement generic webhook integration
        throw new Error("Generic integration not yet implemented");
      default:
        throw new Error(`Unsupported POS system: ${posSystem}`);
    }
  }

  static getSupportedSystems(): { value: POSSystem; label: string }[] {
    return [
      { value: "square", label: "Square" },
      { value: "toast", label: "Toast" },
      { value: "generic", label: "Generic Webhook" },
    ];
  }

  static getRequiredCredentials(posSystem: POSSystem): string[] {
    switch (posSystem) {
      case "square":
        return ["accessToken", "squareLocationId"];
      case "toast":
        return ["clientId", "clientSecret", "restaurantGuid"];
      case "generic":
        return ["webhookUrl", "apiKey"];
      default:
        return [];
    }
  }
}
